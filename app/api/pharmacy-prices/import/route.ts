import { NextResponse } from "next/server";
import { db } from "../../../lib/ipn-db";
import { parse } from "csv-parse/sync";

function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}

function toInt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function toFloat(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // Required by spec.
    const pharmacyNpi = (form.get("pharmacyNpi") ?? "").toString().trim();
    if (!pharmacyNpi) {
      return NextResponse.json({ error: "Missing pharmacyNpi" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const text = await file.text();

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    const required = ["drugName", "strength", "quantity", "cashPrice"];
    for (const key of required) {
      if (records.length === 0 || !(key in records[0])) {
        // Best-effort: header mismatch.
        return NextResponse.json({ error: `Missing required column: ${key}` }, { status: 400 });
      }
    }

    const errors: Array<{ row: number; error: string }> = [];
    let rowsRead = 0;
    let created = 0;
    let updated = 0;
    const skipped = 0;



    // Ensure placeholder Pharmacy exists if seed hasn't run.
    await db.pharmacy.upsert({
      where: { npi: pharmacyNpi },
      update: {},
      create: {
        id: `ph-${pharmacyNpi}`,
        npi: pharmacyNpi,
        name: "Unknown pharmacy",
        address1: "",
        address2: null,
        city: "",
        state: "TX",
        zip: "",
        phone: "",
        profileStatus: "unclaimed",
        pricingPublished: false,
        reservationsEnabled: false,
      },
    });

    for (let i = 0; i < records.length; i++) {
      rowsRead++;
      const rowNum = i + 2; // header assumed row 1
      const r = records[i];

      const drugName = (r.drugName ?? "").trim();
      const strength = (r.strength ?? "").trim();
      const quantity = toInt(r.quantity);
      const cashPriceDollars = toFloat(r.cashPrice);
      const ndc = (r.ndc ?? "").toString().trim() || null;

      if (!drugName || !strength || quantity === null || cashPriceDollars === null) {
        errors.push({ row: rowNum, error: "Missing or invalid required fields" });
        continue;
      }

      const cashPriceCents = dollarsToCents(cashPriceDollars);
      const status = "active";
      const source = "csv";

      try {
        const existing = await db.drugPrice.findUnique({
          where: {
            pharmacyNpi_drugName_strength_quantity_status: {
              pharmacyNpi,
              drugName,
              strength,
              quantity,
              status,
            },
          },
          select: { id: true },
        });

        if (existing) {
          await db.drugPrice.update({
            where: { id: existing.id },
            data: {
              cashPriceCents,
              ndc,
              source,
              effectiveDate: new Date(),
            },
          });
          updated++;
        } else {
          await db.drugPrice.create({
            data: {
              id: `dp-${pharmacyNpi}-${drugName}-${strength}-${quantity}-${status}`,
              pharmacyId: `ph-${pharmacyNpi}`,
              pharmacyNpi,
              drugName,
              strength,
              quantity,
              cashPriceCents,
              ndc,
              source,
              status,
              effectiveDate: new Date(),
            },
          });
          created++;

        }
      } catch (e) {
      errors.push({ row: rowNum, error: e instanceof Error ? e.message : "Unknown error" });

      }
    }

    return NextResponse.json(
      {
        rowsRead,
        created,
        updated,
        skipped,
        errors,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

