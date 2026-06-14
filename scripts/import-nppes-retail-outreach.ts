/*
  Build retail outreach priority list from existing importer outputs.

  Source:
    data/ipn/likely-independent-pharmacies.csv

  Output:
    data/ipn/retail-independent-outreach-priority.csv
    data/ipn/{state}-retail-independent-outreach-priority.csv

  Filters (per requirements):
    - state in TX/FL/OH/PA/NC/NY
    - matched_taxonomy_codes contains 3336C0003X OR 333600000X
    - organization_name contains PHARMACY OR DRUG OR APOTHECARY OR RX
    - chain_exclusion_match is empty

  Exclusions:
    INFUSION, MEDICAL EQUIPMENT, SUPPLY, COUNTY, HOSPITAL, LONG TERM, LTC,
    INSTITUTIONAL, MAIL ORDER, HOME INFUSION
*/

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import { createReadStream, createWriteStream } from "node:fs";
import { finished } from "node:stream/promises";
import type { WriteStream } from "node:fs";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "..", "data", "ipn");


const STATES = ["TX", "FL", "OH", "PA", "NC", "NY"] as const;

const IN_FILE = path.join(OUTPUT_DIR, "likely-independent-pharmacies.csv");

const OUT_FILE_ALL = path.join(OUTPUT_DIR, "retail-independent-outreach-priority.csv");

const OUT_BY_STATE: Record<(typeof STATES)[number], string> = STATES.reduce(
  (acc, s) => {
    acc[s] = path.join(
      OUTPUT_DIR,
      `${s.toLowerCase()}-retail-independent-outreach-priority.csv`
    );
    return acc;
  },
  {} as Record<(typeof STATES)[number], string>
);


const header = [

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

function escapeCsvValue(v: string): string {
  const s = v ?? "";
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatCsvLine(cols: string[]): string {
  return cols.map(escapeCsvValue).join(",");
}



const CORE_TAXONOMY_PATTERNS = ["3336C0003X", "333600000X"]; // substring matches

const ORG_INCLUDE_REGEX = /\b(PHARMACY|DRUG|APOTHECARY|RX)\b/i;

const EXCLUDE_REGEX = [
  "INFUSION",
  "MEDICAL EQUIPMENT",
  "SUPPLY",
  "COUNTY",
  "HOSPITAL",
  "LONG TERM",
  "LTC",
  "INSTITUTIONAL",
  "MAIL ORDER",
  "HOME INFUSION",
].map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const EXCLUDE_ORG_REGEX = new RegExp(`(?:${EXCLUDE_REGEX.join("|")})`, "i");

function isEmptyChainExclusionMatch(v: string): boolean {
  const s = (v ?? "").trim();
  return s.length === 0;
}

function matchesCoreTaxonomy(matchedTaxonomyCodes: string): boolean {
  const s = matchedTaxonomyCodes ?? "";
  // Taxonomy codes are joined with '|'
  return CORE_TAXONOMY_PATTERNS.some((p) => s.includes(p));
}

type Row = Record<string, string>;

type OutRow = {
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
  pharmacy_tier: string;
  primary_pharmacy_flag: string;
  likely_independent: string;
  chain_exclusion_match: string;
};

function toOutRow(r: Row): OutRow {
  return {
    npi: r["npi"] ?? "",
    organization_name: r["organization_name"] ?? "",
    address_1: r["address_1"] ?? "",
    address_2: r["address_2"] ?? "",
    city: r["city"] ?? "",
    state: r["state"] ?? "",
    zip: r["zip"] ?? "",
    phone: r["phone"] ?? "",
    authorized_official_title: r["authorized_official_title"] ?? "",
    matched_taxonomy_codes: r["matched_taxonomy_codes"] ?? "",
    pharmacy_tier: r["pharmacy_tier"] ?? "",
    primary_pharmacy_flag: r["primary_pharmacy_flag"] ?? "",
    likely_independent: r["likely_independent"] ?? "",
    chain_exclusion_match: r["chain_exclusion_match"] ?? "",
  };
}

function buildOutLine(r: OutRow): string {
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

async function main() {
  if (!fs.existsSync(IN_FILE)) {
    throw new Error(`Missing input: ${IN_FILE}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const wsAll = createWriteStream(OUT_FILE_ALL, { encoding: "utf8" });
  wsAll.write(header + "\n");

  const wsByState: Partial<Record<(typeof STATES)[number], ReturnType<typeof createWriteStream>>> = {};
  for (const s of STATES) {
    const ws = createWriteStream(OUT_BY_STATE[s], { encoding: "utf8" });
    ws.write(header + "\n");
    wsByState[s] = ws;
  }

  const counts: Record<(typeof STATES)[number], number> = STATES.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
}, {} as Record<(typeof STATES)[number], number>);


  const inputStream = createReadStream(IN_FILE);
  const parser = inputStream.pipe(
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

  let scanned = 0;
  for await (const row of parser as unknown as AsyncIterable<Row>) {

    scanned++;

    const state = (row["state"] ?? "").trim();
    if (!(STATES as readonly string[]).includes(state)) continue;

    const matchedTax = row["matched_taxonomy_codes"] ?? "";
    if (!matchesCoreTaxonomy(matchedTax)) continue;

    const org = row["organization_name"] ?? "";
    if (!ORG_INCLUDE_REGEX.test(org)) continue;
    if (EXCLUDE_ORG_REGEX.test(org)) continue;

    const chainExcl = row["chain_exclusion_match"] ?? "";
    if (!isEmptyChainExclusionMatch(chainExcl)) continue;

    const out = toOutRow(row);
    wsAll.write(buildOutLine(out) + "\n");
    wsByState[state as (typeof STATES)[number]]!.write(buildOutLine(out) + "\n");
    counts[state as (typeof STATES)[number]]++;
  }

  wsAll.end();
  for (const s of STATES) wsByState[s]?.end();

await Promise.all([
    finished(wsAll as unknown as WriteStream),
    ...STATES.map((s) => {
      const ws = wsByState[s];
      return ws ? finished(ws as unknown as WriteStream) : Promise.resolve();
    }),
  ]).catch(() => {});



  console.log("[import-nppes-retail-outreach] counts:");
  console.log(`- input scanned rows: ${scanned}`);
  for (const s of STATES) {
    console.log(`- ${s}: ${counts[s]}`);
  }
}

main().catch((err) => {
  console.error("[import-nppes-retail-outreach] failed:");
  console.error(err);
  process.exit(1);
});

