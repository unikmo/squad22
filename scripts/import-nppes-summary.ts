/*
  Summary companion for scripts/import-nppes.ts

  Reads the generated CSVs (and basic stats json if present) and prints row counts per file.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "..", "data", "ipn");


const FILES = [
  "all-target-state-pharmacies.csv",
  "likely-independent-pharmacies.csv",
  "high-confidence-owner-led-pharmacies.csv",
  "tx-pharmacies.csv",
  "fl-pharmacies.csv",
  "oh-pharmacies.csv",
  "pa-pharmacies.csv",
  "nc-pharmacies.csv",
  "ny-pharmacies.csv",
];

function countCsvRows(filePath: string): number {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  // subtract header if present
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  return Math.max(0, nonEmpty.length - 1);
}

function main() {
  console.log("[import-nppes:summary] CSV row counts (deduped):");
  for (const f of FILES) {
    const fp = path.join(OUTPUT_DIR, f);
    if (!fs.existsSync(fp)) {
      console.log(`- ${f}: MISSING`);
      continue;
    }
    const c = countCsvRows(fp);
    console.log(`- ${f}: ${c}`);
  }
}

main();

