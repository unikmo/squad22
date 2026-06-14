/*
  Local one-time importer for ClinCalc Top 300 drug list.

  Goals:
  - Scrape Top300 index page + each drug detail page
  - Throttle requests (>= 1 request/sec)
  - Cache responses locally so reruns are deterministic and do not hammer ClinCalc
  - Output:
    1) Prisma seed JSON files
    2) Static app seed TS module for dev/test

  Runtime note:
  - This script is NOT used by the application at runtime.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request } from "undici";
import * as cheerio from "cheerio";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Top300IndexRow = {
  rank: number;
  drug_name: string;
  drug_detail_url: string;
  total_prescriptions?: number;
  total_patients?: number;
  annual_change?: number;
};

type ClinCalcDrugDetail = {
  brand_name_synonyms: string[];
  generic_synonyms: string[];
  therapeutic_classes: string[];
  dispensed_dosage_forms: string[];
  related_drugs: string[];
  first_dosage_form?: string;
};

type SeedDrug = {
  rank: number;
  canonicalGenericName: string;
  aliases: string[]; // brands + other synonyms
  therapeuticClasses: string[];
  dispensedDosageForms: string[];
  firstDosageForm?: string;
  metadata: {
    totalPrescriptions?: number;
    totalPatients?: number;
    annualChange?: number;
    source: {
      clinccalc: {
        top300IndexUrl: string;
        drugDetailUrl: string;
      };
    };
  };
};

type SeedOutput = {
  generatedAtISO: string;
  source: {
    clinccalc: {
      top300IndexUrl: string;
    };
  };
  drugs: SeedDrug[];
};

type CliArgs = {
  outDir: string;
  top300Url: string;
  cacheDir: string;
  delayMs: number;
  limit?: number;
};

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const get = (flag: string, defaultValue?: string) => {
    const idx = args.indexOf(flag);
    if (idx === -1) return defaultValue;
    return args[idx + 1] ?? defaultValue;
  };

  const outDir = get("--out", path.join(__dirname, "..", "prisma", "seed"))!;
  const top300Url = get(
    "--top300Url",
    "https://clincalc.com/DrugStats/Top300Drugs.aspx"
  )!;
  const cacheDir = get("--cacheDir", path.join(__dirname, "..", "scripts", "cache", "clinccalc"))!;
  const delayMs = Number(get("--delayMs", "1100"));
  const limitRaw = get("--limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;

  return {
    outDir,
    top300Url,
    cacheDir,
    delayMs: Number.isFinite(delayMs) ? delayMs : 1100,
    limit: limit ? Math.max(1, limit) : undefined,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeFilename(s: string) {
  return s
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 200);
}

function getCachePath(cacheDir: string, url: string) {
  const u = new URL(url);
  const hostDir = safeFilename(u.host);
  const file = safeFilename(u.pathname + (u.search ? `_${u.search}` : ""));
  return path.join(cacheDir, hostDir, `${file}.html`);
}

async function fetchWithCache(cacheDir: string, url: string, delayMs: number): Promise<string> {
  await sleep(delayMs);

  const cachePath = getCachePath(cacheDir, url);
  if (fs.existsSync(cachePath)) return fs.readFileSync(cachePath, "utf8");

  fs.mkdirSync(path.dirname(cachePath), { recursive: true });

  // Use undici default dispatcher.
  // Throttling + caching ensures we don't overload ClinCalc.
  const res = await request(url, {
    method: "GET",
    headers: {
      "user-agent": "IPN-ClinCalc-Seeder/1.0 (local import; no runtime usage)",
      "accept": "text/html,application/xhtml+xml",
    },
  });


  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`ClinCalc fetch failed ${res.statusCode} for ${url}`);
  }

  const text = await res.body.text();
  fs.writeFileSync(cachePath, text, "utf8");
  return text;
}

function parseNumberLoose(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const cleaned = s.replace(/[^0-9.\-]/g, "").trim();
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function absolutize(baseUrl: string, maybeUrl: string): string {
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return maybeUrl;
  }
}

function parseTop300Index(html: string, baseUrl: string): Top300IndexRow[] {
  const $ = cheerio.load(html);

  // The page is an ASP.NET table. We target rows with numeric rank.
  const rows: Top300IndexRow[] = [];

  // Try finding a table first.
  const table = $("table").first();
  const trs = table.find("tr");

  trs.each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length === 0) return;

    const first = $(tds.get(0)).text().trim();
    const rank = Number(first.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(rank) || rank <= 0) return;

    // Heuristics: drug name usually appears next.
    const drug_name = $(tds.get(1)).text().trim();

    const a = $(tds.get(1)).find("a").first();
    const href = a.attr("href");
    const drug_detail_url = href ? absolutize(baseUrl, href) : absolutize(baseUrl, drug_name);

    // Other numeric columns are taken from subsequent tds if present.
    const total_prescriptions = parseNumberLoose($(tds.get(2)).text());
    const total_patients = parseNumberLoose($(tds.get(3)).text());
    const annual_change = parseNumberLoose($(tds.get(4)).text());

    rows.push({
      rank,
      drug_name,
      drug_detail_url,
      total_prescriptions,
      total_patients,
      annual_change,
    });
  });

  return rows.sort((a, b) => a.rank - b.rank);
}

function uniq(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}

function parseDetail(html: string): ClinCalcDrugDetail {
  const $ = cheerio.load(html);


  const getListFromSection = (labelRegex: RegExp) => {
    // Find text nodes matching labelRegex and then scrape following content block.
    // This is heuristic; ClinCalc layout can change.
    const texts = $("*".toString()).filter((_: number, el) => labelRegex.test($(el).text().trim()));


    if (texts.length === 0) return [];

    // Take parent and grab all anchors/text after it.
    const el = texts.get(0);
    const parent = $(el).parent();

    const candidates = parent.find("a").toArray().map((a) => $(a).text().trim());
    const fallback = parent.text().split(/\r?\n|,/).map((t) => t.trim());

    const merged = candidates.length > 0 ? candidates : fallback;
    return uniq(merged.filter((x) => x && x.length > 1));
  };

  // ClinCalc detail page has headings like Brand Names / Generic Names / Therapeutic Classes.
  // We'll rely on labelRegex heuristics.
  const brand_name_synonyms = getListFromSection(/Brand/i);
  const generic_synonyms = getListFromSection(/Generic/i);
  const therapeutic_classes = getListFromSection(/Therapeutic/i);
  const dispensed_dosage_forms = getListFromSection(/Dosage/i);

  // Related drugs may appear in a dedicated section; heuristic.
  const related_drugs = getListFromSection(/Related/i);

  // First dosage form: fallback to first item from dispensed_dosage_forms.
  const first_dosage_form = dispensed_dosage_forms[0];

  return {
    brand_name_synonyms,
    generic_synonyms,
    therapeutic_classes,
    dispensed_dosage_forms,
    related_drugs,
    first_dosage_form,
  };
}

function canonicalizeGenericName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function toSeedDrug(row: Top300IndexRow, detail: ClinCalcDrugDetail): SeedDrug {
  // Choose canonical generic from row.drug_name if it looks generic-ish.
  // Otherwise, fallback to first generic_synonyms.
  const genericFromRow = canonicalizeGenericName(row.drug_name);
  const canonical =
    detail.generic_synonyms.find((g) => g.toLowerCase() === genericFromRow.toLowerCase()) ??
    detail.generic_synonyms[0] ??
    genericFromRow;

  const aliases = uniq([
    ...(detail.brand_name_synonyms || []),
    ...(detail.generic_synonyms || []),
  ]);

  return {
    rank: row.rank,
    canonicalGenericName: canonical,
    aliases,
    therapeuticClasses: uniq(detail.therapeutic_classes || []),
    dispensedDosageForms: uniq(detail.dispensed_dosage_forms || []),
    firstDosageForm: detail.first_dosage_form,
    metadata: {
      totalPrescriptions: row.total_prescriptions,
      totalPatients: row.total_patients,
      annualChange: row.annual_change,
      source: {
        clinccalc: {
          top300IndexUrl: "(seed script)",
          drugDetailUrl: row.drug_detail_url,
        },
      },
    },
  };
}

function emitStaticTSModule(outFile: string, drugs: SeedDrug[]) {
  const normalized = drugs.map((d) => {
    return {
      rank: d.rank,
      canonicalGenericName: d.canonicalGenericName,
      aliases: d.aliases,
      therapeuticClasses: d.therapeuticClasses,
      dispensedDosageForms: d.dispensedDosageForms,
      firstDosageForm: d.firstDosageForm,
    };
  });

  const content = `/*
  AUTO-GENERATED by scripts/import-clinccalc-top300.ts
  DO NOT EDIT MANUALLY.
*/

export type IPNTop300DrugSeed = {
  rank: number;
  canonicalGenericName: string;
  aliases: string[];
  therapeuticClasses: string[];
  dispensedDosageForms: string[];
  firstDosageForm?: string;
};

export const IPN_TOP300_DRUGS: IPNTop300DrugSeed[] = ${JSON.stringify(
    normalized,
    null,
    2
  )} as const;
`;

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, content, "utf8");
}

async function main() {
  const args = parseArgs();
  const outDir = path.resolve(args.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[import-clinccalc-top300] Top300 URL: ${args.top300Url}`);
  console.log(`[import-clinccalc-top300] Cache dir: ${args.cacheDir}`);
  console.log(`[import-clinccalc-top300] Out dir: ${outDir}`);
  console.log(`[import-clinccalc-top300] Throttle delay: ${args.delayMs}ms`);

  const indexHtml = await fetchWithCache(args.cacheDir, args.top300Url, args.delayMs);
  const rows = parseTop300Index(indexHtml, args.top300Url);

  const limited = args.limit ? rows.slice(0, args.limit) : rows;
  console.log(`[import-clinccalc-top300] Found ${rows.length} rows. Using ${limited.length}.`);

  const drugs: SeedDrug[] = [];

  for (const [i, row] of limited.entries()) {
    console.log(`[import-clinccalc-top300] (${i + 1}/${limited.length}) Fetch detail: ${row.drug_detail_url}`);
    const detailHtml = await fetchWithCache(args.cacheDir, row.drug_detail_url, args.delayMs);
    const detail = parseDetail(detailHtml);

    const seedDrug = toSeedDrug(row, detail);
    // Ensure canonical name is present.
    if (!seedDrug.canonicalGenericName) {
      seedDrug.canonicalGenericName = row.drug_name;
    }
    drugs.push(seedDrug);
  }

  const seedOutput: SeedOutput = {
    generatedAtISO: new Date().toISOString(),
    source: {
      clinccalc: { top300IndexUrl: args.top300Url },
    },
    drugs,
  };

  const seedJsonPath = path.join(outDir, "clinccalc-top300-drugs.json");
  fs.writeFileSync(seedJsonPath, JSON.stringify(seedOutput, null, 2), "utf8");

  // Also emit static TS module for immediate dev/test use.
  // This will be used by the Next app (static import).
  const tsOut = path.join(__dirname, "..", "app", "lib", "ipn-drugs-top300.ts");
  emitStaticTSModule(tsOut, drugs);

  console.log(`[import-clinccalc-top300] Wrote: ${seedJsonPath}`);
  console.log(`[import-clinccalc-top300] Wrote: ${tsOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

