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
    const inviteToken = getString(form, "inviteToken").trim();

    if (!pharmacyNpiRaw && !inviteToken) {
      return NextResponse.json({ error: "Missing npi" }, { status: 400 });
    }

    // Invite-bound flow: derive pharmacyNpi from ClaimInvite.
    let derivedPharmacyNpi: string | null = null;
    let claimInvite: { token: string; pharmacyNpi: string; status: string; usedClaimId: string | null } | null = null;

    if (inviteToken) {
      claimInvite = await db.claimInvite.findUnique({
        where: { token: inviteToken },
        select: { token: true, pharmacyNpi: true, status: true, usedClaimId: true },
      });


      if (!claimInvite) return NextResponse.json({ error: "Invalid inviteToken" }, { status: 400 });
      if (claimInvite.status !== "active") return NextResponse.json({ error: "Invite token not active" }, { status: 400 });

      derivedPharmacyNpi = claimInvite.pharmacyNpi;
    }

    const finalPharmacyNpi = (derivedPharmacyNpi ?? pharmacyNpiRaw).trim();

    // For MVP: if pharmacy does not exist (seed not run yet), create a minimal placeholder.
    // Seed is expected to populate full address fields.
    const pharmacy = await db.pharmacy.upsert({
      where: { npi: finalPharmacyNpi },
      update: {},
      create: {
        id: `ph-${finalPharmacyNpi}`,
        npi: finalPharmacyNpi,
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
        website: null,
        email: null,
        preferredContactMethod: null,
        outreachStatus: "not_started",
        outreachLastSentAt: null,
        outreachAttempts: 0,
        enrichmentStatus: "missing",
        enrichmentSource: null,
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
          inviteToken: inviteToken || null,
        },
      },
      select: { id: true, createdAt: true, pharmacyNpi: true, status: true },
    });

    if (inviteToken && claimInvite) {
      await db.$transaction(async (tx) => {
        await tx.claimInvite.update({
          where: { token: inviteToken },
          data: { status: "used", usedClaimId: created.id },
        });

        await tx.pharmacy.update({
          where: { npi: pharmacy.npi },
          data: {
            profileStatus: "pending_claim",
            outreachStatus: "claim_submitted",
          },
        });
      });
    } else {
      await db.pharmacy.update({
        where: { npi: pharmacy.npi },
        data: { profileStatus: "pending_claim" },
      });
    }


    return NextResponse.redirect(
      new URL(`/claim/confirmation?claimId=${encodeURIComponent(created.id)}&npi=${encodeURIComponent(pharmacy.npi)}`, req.url),
      303,
    );
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

