import { NextResponse } from "next/server";
import { db } from "../../../app/lib/ipn-db";

function getString(form: FormData, key: string) {
  const v = form.get(key);
  if (typeof v !== "string") return "";
  return v;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const claimId = getString(form, "claimId").trim();
    const action = getString(form, "action").trim();

    if (!claimId) return NextResponse.json({ error: "Missing claimId" }, { status: 400 });

    const claim = await db.pharmacyClaim.findUnique({
      where: { id: claimId },
      select: { id: true, pharmacyNpi: true },
    });

    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

    if (action === "APPROVED") {
      await db.pharmacyClaim.update({
        where: { id: claimId },
        data: { status: "APPROVED" },
      });

      await db.pharmacy.update({
        where: { npi: claim.pharmacyNpi },
        data: {
          profileStatus: "claimed",
          pricingPublished: false,
          reservationsEnabled: false,
        },
      });
    } else if (action === "REJECTED") {
      await db.pharmacyClaim.update({
        where: { id: claimId },
        data: { status: "REJECTED" },
      });
    } else if (action === "NEEDS_MORE_INFO") {
      await db.pharmacyClaim.update({
        where: { id: claimId },
        data: { status: "NEEDS_MORE_INFO" },
      });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

