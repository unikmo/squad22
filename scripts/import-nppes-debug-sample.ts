/*
  Minimal NPPES CSV parser sanity test.

  Goal: prove that streaming parsing works and that column names match
  by printing the first ~100 parsed rows.
*/

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";

const INPUT_CSV = path.resolve("C:/Users/mbanw/ipnus", "npidata.csv");

const DEBUG_LIMIT = 100;
const PRINT_ROWS = 3;

const INPUT_HEADER_PREFIX = "Healthcare Provider Taxonomy Code_";
const INPUT_PRIMARY_SWITCH_PREFIX = "Healthcare Provider Primary Taxonomy Switch_";

function safeTrim(s: unknown): string {
  return String(s ?? "").trim();
}

async function main() {
  const exists = fs.existsSync(INPUT_CSV);
  console.log(`[import-nppes-debug-sample] input exists: ${exists}`);
  if (!exists) process.exit(1);

  const stat = fs.statSync(INPUT_CSV);
  console.log(`[import-nppes-debug-sample] input path: ${INPUT_CSV}`);
  console.log(`[import-nppes-debug-sample] input size (bytes): ${stat.size}`);

  // Peek header
  const fd = fs.openSync(INPUT_CSV, "r");
  const buf = Buffer.alloc(1024 * 1024);
  const n = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const peek = buf.toString("utf8", 0, n);
  const firstNewline = peek.indexOf("\n");
  const firstLine = firstNewline >= 0 ? peek.slice(0, firstNewline).replace(/\r$/, "") : peek.trim();

  // For accurate splitting of CSV header with quotes, we use a quick csv-parse of just the header line.
  const headerParser = parse({ columns: false, relax_quotes: true, relax_column_count: true, trim: false, delimiter: "," });
  const headers: string[] = [];
  headerParser.on("readable", () => {
    let rec: string[] | null;
     
    while ((rec = headerParser.read()) !== null) {
      headers.push(...rec.map((x) => safeTrim(x)));
    }
  });
  headerParser.write(firstLine + "\n");
  headerParser.end();

  // csv-parse is sync-ish for small content; ensure we got it.
  const headerCount = headers.length || (firstLine ? firstLine.split(/","/).length : 0);

  console.log(`[import-nppes-debug-sample] header count (detected): ${headerCount}`);
  console.log(`[import-nppes-debug-sample] first 20 header names:`);
  console.log(headers.slice(0, 20));

  const parser = parse({
    columns: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: false,
    delimiter: ",",
  });

  const inputStream = fs.createReadStream(INPUT_CSV, { encoding: "utf8" });

  let rowCount = 0;
  const printed = { count: 0 };

  parser.on("readable", () => {
    let record: Record<string, string> | null;
     
    while ((record = parser.read()) !== null) {
      rowCount++;

      if (printed.count < PRINT_ROWS) {
        const r = record as Record<string, string>;

        const out = {
          NPI: safeTrim(r["NPI"]),
          "Entity Type Code": safeTrim(r["Entity Type Code"]),
          "Provider Organization Name (Legal Business Name)": safeTrim(
            r["Provider Organization Name (Legal Business Name)"]
          ),
          "Provider Business Practice Location Address State Name": safeTrim(
            r["Provider Business Practice Location Address State Name"]
          ),
          "Healthcare Provider Taxonomy Code_1": safeTrim(r[`${INPUT_HEADER_PREFIX}1`]),
          "Healthcare Provider Taxonomy Code_2": safeTrim(r[`${INPUT_HEADER_PREFIX}2`]),
          "Healthcare Provider Primary Taxonomy Switch_1": safeTrim(
            r[`${INPUT_PRIMARY_SWITCH_PREFIX}1`]
          ),
        "Healthcare Provider Primary Taxonomy Switch_2": safeTrim(
            r[`${INPUT_PRIMARY_SWITCH_PREFIX}2`]
          ),

        };

        console.log(`[import-nppes-debug-sample] row ${printed.count + 1}:`);
        console.log(out);
        printed.count++;
      }

      if (rowCount >= DEBUG_LIMIT) {
        inputStream.destroy();
        break;
      }
    }
  });

  inputStream.pipe(parser);

  await new Promise<void>((resolve) => {
    parser.on("end", () => resolve());
    inputStream.on("close", () => resolve());
    parser.on("error", () => resolve());
    inputStream.on("error", () => resolve());
  });

  console.log(`[import-nppes-debug-sample] done. Parsed rows: ${rowCount} (limit ${DEBUG_LIMIT}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

