import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";

function getString(form: FormData, key: string) {
  const v = form.get(key);
  if (typeof v !== "string") return "";
  return v;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayYYMMDD(d = new Date()) {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yy}${mm}${dd}`;
}

function reservationNumberFromParts(yyMMdd: string, seq: number) {
  const suffix = String(seq).padStart(6, "0");
  return `${yyMMdd}${suffix}`;
}

function createdIdForReservation(reservationNumber: string, pharmacyNpi: string) {
  return `r-${pharmacyNpi}-${reservationNumber}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const npi = getString(form, "npi").trim();
    const pharmacyNpi = npi; // alias

    const drug = getString(form, "drug").trim();
    const strength = getString(form, "strength").trim();
    const quantity = Math.max(1, Number(getString(form, "quantity") || "30"));
    const zip = getString(form, "zip").trim();

    const firstName = getString(form, "firstName").trim();
    const lastName = getString(form, "lastName").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Patient";

    const phone = getString(form, "phone").trim();
    const email = getString(form, "email").trim();
    const notes = getString(form, "notes").trim();

    const reservePriceRaw = getString(form, "reservePrice").trim();
    const priceLowRaw = getString(form, "priceLow").trim();
    const priceHighRaw = getString(form, "priceHigh").trim();

    const reservePrice = Number(reservePriceRaw || "0");
    const priceLow = Number(priceLowRaw || "0");
    const priceHigh = Number(priceHighRaw || "0");

    if (!pharmacyNpi) return NextResponse.json({ error: "Missing pharmacy npi" }, { status: 400 });
    if (!drug) return NextResponse.json({ error: "Missing drug" }, { status: 400 });

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
        reservationsEnabled: true,
      },
    });

    const yyMMdd = todayYYMMDD();

    const counter = await db.reservationCounter.findUnique({ where: { yyMMdd } });
    const nextNumber = counter?.nextNumber ?? 1;

    const reservationNumber = reservationNumberFromParts(yyMMdd, nextNumber);

    const created = await db.reservation.create({
      data: {
        id: createdIdForReservation(reservationNumber, pharmacyNpi),
        reservationNumber,
        status: "pending",
        reservationFeeCents: 500,
        reservationFeeStatus: "waived",
        pharmacyNpi,
        reservationInput: {
          fullName,
          phone,
          email: email || null,
          rxUpload: null,
          notes: notes || null,
          strength: strength || null,
          quantity,
          zip,
          drug,
        },
        priceResult: {
          reservePrice,
          currency: "USD",
          priceLow,
          priceHigh,
          drug,
          strength: strength || null,
          quantity,
          zip,
        },
      },
      select: {
        id: true,
        reservationNumber: true,
        createdAt: true,
        status: true,
        reservationFeeCents: true,
        reservationFeeStatus: true,
      },
    });

    await db.reservationCounter.upsert({
      where: { yyMMdd },
      update: { nextNumber: nextNumber + 1 },
      create: { id: yyMMdd, yyMMdd, nextNumber: nextNumber + 1 },
    });

    return NextResponse.redirect(
      new URL(
        `/reservation/confirmation?reservationId=${encodeURIComponent(created.id)}&reservationNumber=${encodeURIComponent(
          created.reservationNumber,
        )}&npi=${encodeURIComponent(pharmacyNpi)}`,
        req.url,
      ),
      303,
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

