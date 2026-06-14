import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

type Row = Record<string, string>;

function normalize(value: string | undefined | null) {
  return (value ?? "").trim();
}

function get(row: Row, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined) {
      return row[key];
    }
  }

  return "";
}

async function main() {
  const csvPath = path.join(
    process.cwd(),
    "data/ipn/retail-independent-outreach-priority.csv"
  );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Row[];

  let scanned = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const stateCounts: Record<string, number> = {};

  for (const row of records) {
    scanned++;

    const npi = normalize(get(row, "npi", "NPI"));

    if (!npi) {
      skipped++;
      continue;
    }

    const state = normalize(get(row, "state", "State")).toUpperCase();
    stateCounts[state] = (stateCounts[state] ?? 0) + 1;

    const id = `ph-${npi}`;

    const name = normalize(
      get(row, "organization_name", "pharmacyName", "name", "Pharmacy Name")
    );

    const address1 = normalize(
      get(row, "address_1", "address1", "Address1", "address", "Address")
    );

    const address2 = normalize(get(row, "address_2", "address2", "Address2"));
    const city = normalize(get(row, "city", "City"));
    const zip = normalize(get(row, "zip", "Zip", "postal_code", "Postal Code"));
    const phone = normalize(get(row, "phone", "Phone"));

    const existing = await prisma.pharmacy.findUnique({
      where: { npi },
      select: { id: true },
    });

    if (existing) {
      await prisma.pharmacy.update({
        where: { npi },
        data: {
          name,
          address1,
          address2: address2 || null,
          city,
          state,
          zip,
          phone,
        },
      });

      updated++;
    } else {
      await prisma.pharmacy.create({
        data: {
          id,
          npi,
          name,
          address1,
          address2: address2 || null,
          city,
          state,
          zip,
          phone,
        },
      });

      created++;
    }
  }

  console.log("Seed completed");
  console.log(`Scanned: ${scanned}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log("State counts:", stateCounts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });