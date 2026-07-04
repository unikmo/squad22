import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";
import { canManagePharmacy } from "../../lib/ipn-authorization";

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function dollarsToCents(dollars: number) {
  // Use banker-safe conversion for typical 2-decimal inputs.
  return Math.round(dollars * 100);
}

async function getBody(req: Request) {
  if (req.headers.get("content-type")?.includes("application/json")) return req.json().catch(() => ({}));
  const form = await req.formData();
  return Object.fromEntries(form.entries());
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pharmacyNpi = url.searchParams.get("pharmacyNpi")?.trim() || "";

    if (!pharmacyNpi) {
      return NextResponse.json({ error: "Missing pharmacyNpi" }, { status: 400 });
    }
    const access = await canManagePharmacy(pharmacyNpi);
    if (!access.allowed) return NextResponse.json({ error: access.reason === "unauthenticated" ? "Authentication required" : "Forbidden" }, { status: access.reason === "unauthenticated" ? 401 : 403 });

    const prices = await db.drugPrice.findMany({
      where: { pharmacyNpi },
      orderBy: [{ drugName: "asc" }, { strength: "asc" }, { quantity: "asc" }, { status: "asc" }],
    });

    return NextResponse.json({ ok: true, prices }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = (await getBody(req)) as Record<string, unknown>;

    const pharmacyNpi = (body.pharmacyNpi ?? "").toString().trim();
    const drugName = (body.drugName ?? "").toString().trim();
    const strength = (body.strength ?? "").toString().trim();
    const quantity = toNumber(body.quantity);
    const cashPriceDollars = toNumber(body.cashPrice);
    const ndc = (body.ndc === undefined ? null : (body.ndc as string | null)) as string | null;
    const productType = (body.productType ?? "prescription").toString().trim().toLowerCase();


    if (!pharmacyNpi) return NextResponse.json({ error: "Missing pharmacyNpi" }, { status: 400 });
    const access = await canManagePharmacy(pharmacyNpi);
    if (!access.allowed) return NextResponse.json({ error: access.reason === "unauthenticated" ? "Authentication required" : "Forbidden" }, { status: access.reason === "unauthenticated" ? 401 : 403 });
    if (!drugName) return NextResponse.json({ error: "Missing drugName" }, { status: 400 });
    if (!strength) return NextResponse.json({ error: "Missing strength" }, { status: 400 });
    if (quantity === null) return NextResponse.json({ error: "Missing quantity" }, { status: 400 });
    if (cashPriceDollars === null) return NextResponse.json({ error: "Missing cashPrice" }, { status: 400 });
    if (!["prescription", "otc"].includes(productType)) return NextResponse.json({ error: "productType must be prescription or otc" }, { status: 400 });

    const cashPriceCents = dollarsToCents(cashPriceDollars);

    const rawStatus = body.status;
    const status =
      typeof rawStatus === "string" ? rawStatus : rawStatus == null ? "active" : String(rawStatus);


    const source = (body.source ?? "manual").toString();

    const updated = await db.drugPrice.upsert({



      where: {
        pharmacyNpi_drugName_strength_quantity_status: {
          pharmacyNpi,
          drugName,
          strength,
          quantity: quantity!,
          status,
        },
      },
      update: {
        cashPriceCents,
        ndc: ndc ? ndc.toString().trim() : null,
        source,
        effectiveDate: new Date(),
        productType,
      },
      create: {
        id: `dp-${pharmacyNpi}-${drugName}-${strength}-${quantity}-${status}`,
        pharmacyId: (body.pharmacyId ?? `ph-${pharmacyNpi}`)?.toString() ?? `ph-${pharmacyNpi}`,
        pharmacyNpi,
        drugName,
        strength,
        quantity: quantity!,
        cashPriceCents,
        ndc: ndc ? ndc.toString().trim() : null,
        source,
        status,
        effectiveDate: new Date(),
        productType,
      },
    });

    await db.pharmacy.update({
      where: { npi: pharmacyNpi },
      data: { pricingPublished: true, reservationsEnabled: true },
    });

    return NextResponse.json({ ok: true, price: updated }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await getBody(req)) as Record<string, unknown>;

    const id = (body.id ?? "").toString().trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const existing = await db.drugPrice.findUnique({ where: { id }, select: { pharmacyNpi: true } });
    if (!existing) return NextResponse.json({ error: "Price not found" }, { status: 404 });
    const access = await canManagePharmacy(existing.pharmacyNpi);
    if (!access.allowed) return NextResponse.json({ error: access.reason === "unauthenticated" ? "Authentication required" : "Forbidden" }, { status: access.reason === "unauthenticated" ? 401 : 403 });

    const cashPriceDollars = body.cashPrice === undefined ? undefined : toNumber(body.cashPrice);

    const rawStatus = body.status;
    const status =
      typeof rawStatus === "string" ? rawStatus : rawStatus == null ? undefined : String(rawStatus);

    const updateData: {
      cashPriceCents?: number;
      status?: string;
    } = {};

    if (cashPriceDollars !== undefined) {
      if (cashPriceDollars === null) return NextResponse.json({ error: "Invalid cashPrice" }, { status: 400 });
      updateData.cashPriceCents = dollarsToCents(cashPriceDollars);
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await db.drugPrice.update({


      where: { id },
      data: updateData,

    });

    return NextResponse.json({ ok: true, price: updated }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

