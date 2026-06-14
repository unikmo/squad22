import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";


function getString(form: FormData, key: string) {
  const v = form.get(key);
  if (typeof v !== "string") return "";
  return v;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const pharmacyNpiRaw = getString(form, "npi").trim();
    const pharmacyName = getString(form, "pharmacyName").trim();
    const contactName = getString(form, "contactName").trim();
    const roleTitle = getString(form, "roleTitle").trim();
    const email = getString(form, "email").trim();
    const phone = getString(form, "phone").trim();
    const message = getString(form, "message").trim();

    if (!pharmacyNpiRaw) {
      return NextResponse.json({ error: "Missing npi" }, { status: 400 });
    }

    // For MVP: if pharmacy does not exist (seed not run yet), create a minimal placeholder.
    // Seed is expected to populate full address fields.
    const pharmacy = await db.pharmacy.upsert({
      where: { npi: pharmacyNpiRaw },
      update: {},
      create: {
        id: `ph-${pharmacyNpiRaw}`,
        npi: pharmacyNpiRaw,
        name: pharmacyName || "Unknown pharmacy",
        address1: "",
        address2: null,
        city: "",
        state: "TX",
        zip: "",
        phone: phone || "",
        profileStatus: "unclaimed",
        pricingPublished: false,
        reservationsEnabled: false,
      },
    });

    const created = await db.pharmacyClaim.create({
      data: {
        pharmacyNpi: pharmacy.npi,
        status: "unclaimed",
        submittedPayload: {
          npi: pharmacy.npi,
          pharmacyName,
          contactName,
          roleTitle,
          email,
          phone,
          message: message || null,
        },
      },
      select: { id: true, createdAt: true, pharmacyNpi: true, status: true },
    });

    await db.pharmacy.update({
      where: { npi: pharmacy.npi },
      data: { profileStatus: "pending_claim" },
    });

    return NextResponse.redirect(
      new URL(`/claim/confirmation?claimId=${encodeURIComponent(created.id)}&npi=${encodeURIComponent(pharmacy.npi)}`, req.url),
      303,
    );
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

