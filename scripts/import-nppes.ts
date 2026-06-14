/*
  Streaming one-time importer for NPPES IPN pharmacy directory seed.

  Reads: c:/Users/mbanw/ipnus/npidata.csv
  Outputs multiple CSVs into: data/ipn/

  Filtering:
  - Entity Type Code === 2
  - Any Healthcare Provider Taxonomy Code_1..Code_15 starts with "3336"
  - Target states: TX, FL, OH, PA, NC, NY
  - Chain exclusions by organization name

  Classification:
  - tier_1_primary_pharmacy: at least one matched 3336 taxonomy has corresponding primary switch = "Y"
  - tier_2_secondary_pharmacy: matched 3336 taxonomy exists but none have primary switch = "Y"

  Independence:
  - likely_independent = NOT chain_exclusion_match

  De-dupe:
  - by NPI.
  - If duplicates exist, keep the most complete row using this priority:
      1) row with practice location address
      2) row with phone
      3) row with pharmacy taxonomy primary switch = Y
      4) otherwise first occurrence

  Notes:
  - Uses streaming CSV parsing (no full in-memory load).
  - csv-parse handles quotes/commas.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse";
import { createReadStream, createWriteStream, WriteStream } from "node:fs";
import { finished } from "node:stream/promises";






const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Row = Record<string, string>;

const INPUT_CSV = process.env.NPPES_INPUT
  ? path.resolve(process.env.NPPES_INPUT)
  : path.resolve("C:\\Users\\mbanw\\ipnus", "npidata.csv");

const INPUT_HEADER_PREFIX = "Healthcare Provider Taxonomy Code_";
const INPUT_PRIMARY_SWITCH_PREFIX = "Healthcare Provider Primary Taxonomy Switch_";

const TARGET_STATES = new Set(["TX", "FL", "OH", "PA", "NC", "NY"]);

const CHAIN_KEYWORDS = [
  "CVS",
  "WALGREENS",
  "WALGREEN",
  "WAL-MART",
  "WALMART",
  "RITE AID",
  "KROGER",
  "PUBLIX",
  "COSTCO",
  "TARGET",
  "SAFEWAY",
  "ALBERTSONS",
  "SAM'S CLUB",
  "SAM'S CLUB",
  "SAMS CLUB",
  "SAM'S CLUB",
  "H-E-B",
  "HEB",
  "MEIJER",
  "GIANT EAGLE",
  "STOP & SHOP",
  "SHOPRITE",
  "KAISER",
  "HY-VEE",
  "WINN-DIXIE",
  "FOOD LION",
  "GIANT FOOD",
  "HARRIS TEETER",
];

// Normalize/compile chain regex.
function buildChainRegex(keywords: string[]) {
  // Escape regex special chars; keep spaces flexible.
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = Array.from(
    new Set(
      keywords
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => escape(k).replace(/\\\s+/g, "\\s+"))
    )
  );
  // Also allow variations of & to be tolerant.
  return new RegExp(`(?:${parts.join("|")})`, "i");
}

const chainRegex = buildChainRegex(CHAIN_KEYWORDS);

const OWNER_TITLE_REGEX = /(OWNER|PHARMACIST|PRESIDENT|CEO|FOUNDER|MANAGING MEMBER|MEMBER|DIRECTOR)/i;

function safeTrim(s: string | undefined): string {
  return (s ?? "").trim();
}

function rowGet(row: Row, key: string): string {
  return row[key] ?? "";
}

function isNonEmpty(s: string | undefined): boolean {
  return !!s && s.trim().length > 0;
}

function parseEntityTypeCode(row: Row): number {
  const v = rowGet(row, "Entity Type Code");
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
}

function getTaxonomyMatches(row: Row): {
  matchedTaxonomyCodes: string[];
  primaryYByIndex: Map<number, boolean>;
  anyPrimaryY: boolean;
} {
  const matchedTaxonomyCodes: string[] = [];
  let anyPrimaryY = false;
  const primaryYByIndex = new Map<number, boolean>();

  for (let i = 1; i <= 15; i++) {
    const codeKey = `${INPUT_HEADER_PREFIX}${i}`;
    const swKey = `${INPUT_PRIMARY_SWITCH_PREFIX}${i}`;

    const codeRaw = safeTrim(rowGet(row, codeKey));
    if (!codeRaw) continue;

    const code = codeRaw;
    if (code.startsWith("3336")) {
      matchedTaxonomyCodes.push(code);
      const sw = safeTrim(rowGet(row, swKey)).toUpperCase();
      const isY = sw === "Y";
      primaryYByIndex.set(i, isY);
      if (isY) anyPrimaryY = true;
    }
  }

  return {
    matchedTaxonomyCodes,
    primaryYByIndex,
    anyPrimaryY,
  };
}

function getChainExclusionMatch(orgName: string): string {
  const name = safeTrim(orgName);
  if (!name) return "";
  const m = name.match(chainRegex);
  return m ? m[0] : "";
}



function getTargetState(row: Row): string {

  return safeTrim(rowGet(row, "Provider Business Mailing Address State Name"));
}

function buildOutputCommonColumns(row: Row) {
  const npi = safeTrim(rowGet(row, "NPI"));

  const orgName = safeTrim(rowGet(row, "Provider Organization Name (Legal Business Name)"));
  const address1 = safeTrim(rowGet(row, "Provider First Line Business Practice Location Address"));
  const address2 = safeTrim(rowGet(row, "Provider Second Line Business Practice Location Address"));
  const city = safeTrim(rowGet(row, "Provider Business Practice Location Address City Name"));
  const state = safeTrim(rowGet(row, "Provider Business Practice Location Address State Name"));
  const zip = safeTrim(rowGet(row, "Provider Business Practice Location Address Postal Code"));

  const phone = safeTrim(rowGet(row, "Provider Business Practice Location Address Telephone Number"));
  const authorizedOfficialTitle = safeTrim(rowGet(row, "Authorized Official Title or Position"));

  return {
    npi,
    organization_name: orgName,
    address_1: address1,
    address_2: address2,
    city,
    state,
    zip,
    phone,
    authorized_official_title: authorizedOfficialTitle,
  };
}

function escapeCsvValue(v: string): string {
  const s = v ?? "";
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCsvLine(cols: string[]): string {
  return cols.map((c) => escapeCsvValue(c)).join(",");
}

type OutputRow = {
  npi: string;
  organization_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  authorized_official_title: string;
  matched_taxonomy_codes: string;
  pharmacy_tier: "tier_1_primary_pharmacy" | "tier_2_secondary_pharmacy";
  primary_pharmacy_flag: "Y" | "N";
  likely_independent: "Y" | "N";
  chain_exclusion_match: string;
};

function outputRowFromInput(row: Row): OutputRow | null {
  const entityType = parseEntityTypeCode(row);
  if (entityType !== 2) return null;

  const state = getTargetState(row);
  if (!TARGET_STATES.has(state)) return null;

  const { matchedTaxonomyCodes, anyPrimaryY } = getTaxonomyMatches(row);
  if (matchedTaxonomyCodes.length === 0) return null;

  const orgName = safeTrim(rowGet(row, "Provider Organization Name (Legal Business Name)"));
  const chainExcl = getChainExclusionMatch(orgName);

// const highConfOwnerLed = getHighConfidenceOwnerLed(rowGet(row, "Authorized Official Title or Position"));
  // highConfOwnerLed influences only the dedicated output file.


  const common = buildOutputCommonColumns(row);

  const matched = Array.from(new Set(matchedTaxonomyCodes)).join("|");

  return {
    ...common,
    matched_taxonomy_codes: matched,
    pharmacy_tier: anyPrimaryY ? "tier_1_primary_pharmacy" : "tier_2_secondary_pharmacy",
    primary_pharmacy_flag: anyPrimaryY ? "Y" : "N",
    likely_independent: chainExcl ? "N" : "Y",
    chain_exclusion_match: chainExcl,
  };
}

function rowCompletenessScore(r: OutputRow): number {
  // Higher is better.
  let s = 0;
  if (isNonEmpty(r.address_1) || isNonEmpty(r.address_2)) s += 4;
  if (isNonEmpty(r.phone)) s += 2;
  if (r.primary_pharmacy_flag === "Y") s += 3;
  // Favor tier_1 slightly for completeness.
  if (r.pharmacy_tier === "tier_1_primary_pharmacy") s += 1;
  return s;
}

function outputHeader(): string {
  return [
    "npi",
    "organization_name",
    "address_1",
    "address_2",
    "city",
    "state",
    "zip",
    "phone",
    "authorized_official_title",
    "matched_taxonomy_codes",
    "pharmacy_tier",
    "primary_pharmacy_flag",
    "likely_independent",
    "chain_exclusion_match",
  ].join(",");
}

function buildOutputLine(r: OutputRow): string {
  return formatCsvLine([
    r.npi,
    r.organization_name,
    r.address_1,
    r.address_2,
    r.city,
    r.state,
    r.zip,
    r.phone,
    r.authorized_official_title,
    r.matched_taxonomy_codes,
    r.pharmacy_tier,
    r.primary_pharmacy_flag,
    r.likely_independent,
    r.chain_exclusion_match,
  ]);
}

const OUTPUT_DIR = path.resolve(__dirname, "..", "data", "ipn");

const OUTPUT_FILES = {
  allTarget: path.join(OUTPUT_DIR, "all-target-state-pharmacies.csv"),
  likelyIndependent: path.join(OUTPUT_DIR, "likely-independent-pharmacies.csv"),
  highConfOwnerLed: path.join(OUTPUT_DIR, "high-confidence-owner-led-pharmacies.csv"),
  perState: {
    TX: path.join(OUTPUT_DIR, "tx-pharmacies.csv"),
    FL: path.join(OUTPUT_DIR, "fl-pharmacies.csv"),
    OH: path.join(OUTPUT_DIR, "oh-pharmacies.csv"),
    PA: path.join(OUTPUT_DIR, "pa-pharmacies.csv"),
    NC: path.join(OUTPUT_DIR, "nc-pharmacies.csv"),
    NY: path.join(OUTPUT_DIR, "ny-pharmacies.csv"),
  } as Record<string, string>,
};

type Counters = {
  total_scanned_rows: number;
  entity_type_2_rows: number;
  pharmacy_taxonomy_rows: number;
  target_state_rows: number;
  after_chain_exclusion: number;
  high_confidence_owner_led_rows: number;
  duplicates_by_npi: number;
  unique_npi_kept: number;
  by_state: Record<string, number>;
};

function initCounters(): Counters {
  const by_state: Record<string, number> = {};
  for (const s of TARGET_STATES) by_state[s] = 0;
  return {
    total_scanned_rows: 0,
    entity_type_2_rows: 0,
    pharmacy_taxonomy_rows: 0,
    target_state_rows: 0,
    after_chain_exclusion: 0,
    high_confidence_owner_led_rows: 0,
    duplicates_by_npi: 0,
    unique_npi_kept: 0,
    by_state,
  };
}

function ensureCleanDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  // --- Startup diagnostics ---
  const exists = fs.existsSync(INPUT_CSV);
  console.log(`[import-nppes] input exists: ${exists}`);
  console.log(`[import-nppes] input path: ${INPUT_CSV}`);
  const stat = fs.statSync(INPUT_CSV);
  console.log(`[import-nppes] input size (bytes): ${stat.size}`);

  // Read first line for header (small peek) without loading full file.
  const fd = fs.openSync(INPUT_CSV, "r");
  const buf = Buffer.alloc(1024 * 1024);
  const n = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const peek = buf.toString("utf8", 0, n);
  const firstNewline = peek.indexOf("\n");
  const firstLine = firstNewline >= 0 ? peek.slice(0, firstNewline).replace(/\r$/, "") : peek.trim();
  const headers = firstLine.length ? firstLine.split(/","/).length : 0;
  console.log(`[import-nppes] detected header count (rough split): ${headers}`);
  console.log(`[import-nppes] first line preview (first 500 chars): ${firstLine.slice(0, 500)}`);

  // Parse first 10 rows using a tiny stream.
const debugRows: Row[] = [];

  const tmpParser = parse({
    columns: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: false,
    delimiter: ",",
  });

  const tmpStream = fs.createReadStream(INPUT_CSV, { encoding: "utf8", start: 0 });
  tmpParser.on("readable", () => {
    let rec: Row | null;
    while ((rec = tmpParser.read()) !== null) {
      if (debugRows.length < 20) debugRows.push(rec);
      if (debugRows.length >= 20) {
        tmpStream.destroy();
        break;
      }
    }
  });

  tmpStream.pipe(tmpParser);
await finished(tmpParser as unknown as NodeJS.ReadableStream).catch(() => {});


  // Hard stop if startup diagnostics accidentally drained the stream and caused no further parsing.
  console.log(`[import-nppes] startup diagnostics parsed rows: ${debugRows.length}`);


  if (debugRows.length > 0) {
    const r0 = debugRows[0];
    const entityType0 = parseEntityTypeCode(r0);
    const state0 = getTargetState(r0);
    const tax1 = rowGet(r0, `${INPUT_HEADER_PREFIX}1`);
    const tax2 = rowGet(r0, `${INPUT_HEADER_PREFIX}2`);
    console.log(`[import-nppes] first parsed row diagnostic:`);
    console.log(`  - Entity Type Code: ${entityType0}`);
    console.log(`  - target state: ${state0}`);
    console.log(`  - taxonomy_1: ${tax1}`);
    console.log(`  - taxonomy_2: ${tax2}`);
  } else {
    console.log(`[import-nppes] no rows parsed in startup diagnostics`);
  }

  // If the headers don't match our expected names exactly, we’ll rely on debug file later.

  ensureCleanDir();

  // Initialize output streams and write headers once.
  const header = outputHeader();

  const streamMap: Record<string, WriteStream> = {};
  const openStream = (filePath: string) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const ws = createWriteStream(filePath, { encoding: "utf8" });
    ws.write(header + "\n");
    return ws;
  };

  // Create/overwrite all outputs.
  streamMap.allTarget = openStream(OUTPUT_FILES.allTarget);
  streamMap.likelyIndependent = openStream(OUTPUT_FILES.likelyIndependent);
  streamMap.highConfOwnerLed = openStream(OUTPUT_FILES.highConfOwnerLed);

  for (const st of Object.keys(OUTPUT_FILES.perState)) {
    streamMap[`state_${st}`] = openStream(OUTPUT_FILES.perState[st]);
  }

  const counters = initCounters();

  // De-dupe store
  // Keep best row per NPI.
  const bestByNpi = new Map<string, OutputRow>();
  const firstSeenIndexByNpi = new Map<string, number>();
  const seenCountByNpi = new Map<string, number>();

  let rowIndex = 0;

  const parser = createReadStream(INPUT_CSV).pipe(
    parse({
      columns: true,
      bom: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: false,
      delimiter: ",",
    })
  );

  const debugIterator = process.env.NPPES_DEBUG_ITERATOR === "1";
  const debugIteratorLimit = debugIterator ? 100 : Infinity;

for await (const record of parser as unknown as AsyncIterable<Row>) {


    rowIndex++;
    if (rowIndex % 100 === 0) {
      console.log(`[import-nppes] heartbeat: processed ${rowIndex} rows (of input stream)`);
    }
    if (rowIndex >= debugIteratorLimit) break;

    counters.total_scanned_rows++;

    const entityType = parseEntityTypeCode(record);
    if (entityType !== 2) continue;
    counters.entity_type_2_rows++;

    const state = getTargetState(record);
    const matchedTaxonomy = getTaxonomyMatches(record);

    if (matchedTaxonomy.matchedTaxonomyCodes.length > 0) {
      counters.pharmacy_taxonomy_rows++;
    }

    if (!TARGET_STATES.has(state)) continue;
    counters.target_state_rows++;

    const output = outputRowFromInput(record);
    if (!output) continue;

    const npi = output.npi;
    if (!npi) continue;

    const prevCount = (seenCountByNpi.get(npi) ?? 0) + 1;
    seenCountByNpi.set(npi, prevCount);
    if (prevCount === 2) counters.duplicates_by_npi++;

    const prev = bestByNpi.get(npi);
    if (!prev) {
      bestByNpi.set(npi, output);
      firstSeenIndexByNpi.set(npi, rowIndex);
    } else {
      const scorePrev = rowCompletenessScore(prev);
      const scoreNew = rowCompletenessScore(output);
      if (scoreNew > scorePrev) {
        bestByNpi.set(npi, output);
      } else if (scoreNew === scorePrev) {
        const prevFirst = firstSeenIndexByNpi.get(npi) ?? rowIndex;
        const newFirst = rowIndex;
        if (newFirst < prevFirst) bestByNpi.set(npi, output);
      }
    }
  }


  // Always dump a debug-first-20 slice when we end up with zero unique NPI.
  if (bestByNpi.size === 0) {
    const debugFirst20: Row[] = [];
    const tmpParser2 = parse({
      columns: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: false,
      delimiter: ",",
    });
    const tmpStream2 = fs.createReadStream(INPUT_CSV, { encoding: "utf8", start: 0 });
    tmpParser2.on("readable", () => {
      let rec: Row | null;
      while ((rec = tmpParser2.read()) !== null) {
        if (debugFirst20.length < 20) debugFirst20.push(rec);
        if (debugFirst20.length >= 20) {
          tmpStream2.destroy();
          break;
        }
      }
    });
    tmpStream2.pipe(tmpParser2);
await finished(tmpParser2 as unknown as NodeJS.ReadableStream).catch(() => {});


    const debugPayload = debugFirst20.map((r, idx) => {
      const entityType = parseEntityTypeCode(r);
      const state = getTargetState(r);
      return {
        idx,
        npi: safeTrim(rowGet(r, "NPI")),
        entityType,
        state,
        taxonomy1: rowGet(r, `${INPUT_HEADER_PREFIX}1`),
        taxonomy2: rowGet(r, `${INPUT_HEADER_PREFIX}2`),
        organization_name: safeTrim(rowGet(r, "Provider Organization Name (Legal Business Name)")),
      };
    });

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "debug-first-20-rows.json"),
      JSON.stringify({ writtenAtISO: new Date().toISOString(), debugPayload }, null, 2),
      "utf8"
    );
    console.log(`[import-nppes] wrote debug file: data/ipn/debug-first-20-rows.json`);
  }

  // Write de-duped rows.
  counters.unique_npi_kept = bestByNpi.size;

  for (const r of bestByNpi.values()) {
    streamMap.allTarget.write(buildOutputLine(r) + "\n");

    if (r.likely_independent === "Y") {
      streamMap.likelyIndependent.write(buildOutputLine(r) + "\n");
      counters.after_chain_exclusion++;
    }

    if (OWNER_TITLE_REGEX.test(r.authorized_official_title)) {
      streamMap.highConfOwnerLed.write(buildOutputLine(r) + "\n");
      counters.high_confidence_owner_led_rows++;
    }

    if (TARGET_STATES.has(r.state)) {
      counters.by_state[r.state] = (counters.by_state[r.state] ?? 0) + 1;
      streamMap[`state_${r.state}`].write(buildOutputLine(r) + "\n");
    }
  }

  // Close streams.
  await Promise.all(
    Object.values(streamMap).map(async (ws) => {
      ws.end();
      await new Promise<void>((resolve) => ws.once("close", () => resolve()));
    })
  );

  // Console counts.
  console.log("[import-nppes] counts:");
  console.log(`- total rows scanned: ${counters.total_scanned_rows}`);
  console.log(`- entity type 2 rows: ${counters.entity_type_2_rows}`);
  console.log(`- pharmacy taxonomy rows (3336 matched): ${counters.pharmacy_taxonomy_rows}`);
  console.log(`- target-state pharmacy rows (TX/FL/OH/PA/NC/NY): ${counters.target_state_rows}`);
  console.log(`- after chain exclusion (likely independent): ${counters.after_chain_exclusion}`);
  console.log(`- high-confidence owner-led rows: ${counters.high_confidence_owner_led_rows}`);
  console.log(`- duplicates by NPI encountered: ${counters.duplicates_by_npi}`);
  console.log(`- unique NPI kept: ${counters.unique_npi_kept}`);

  console.log("[import-nppes] count per state (deduped, likely across all-target-state set):");
  for (const st of Array.from(TARGET_STATES).sort()) {
    console.log(`  - ${st}: ${counters.by_state[st] ?? 0}`);
  }
}

main().catch((err) => {
  console.error("[import-nppes] failed:");
  console.error(err);
  process.exit(1);
});

