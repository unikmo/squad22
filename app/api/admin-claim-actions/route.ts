import { NextResponse } from "next/server";
import { db } from "../../../app/lib/ipn-db";
import { isAdmin } from "../../../app/lib/ipn-authorization";

function getString(form: FormData, key: string) {
  const v = form.get(key);
  if (typeof v !== "string") return "";
  return v;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      const fullClaim = await db.pharmacyClaim.findUnique({ where: { id: claimId }, select: { submittedPayload: true } });
      const payload = fullClaim?.submittedPayload && typeof fullClaim.submittedPayload === "object" && !Array.isArray(fullClaim.submittedPayload) ? fullClaim.submittedPayload as Record<string, unknown> : {};
      const ownerEmail = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
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
          assistanceSupportEnabled: payload.assistanceSupportEnabled === true,
          manufacturerAssistanceHelp: payload.manufacturerAssistanceHelp === true,
          foundationAssistanceHelp: payload.foundationAssistanceHelp === true,
          publicProgramHelp: payload.publicProgramHelp === true,
          localAssistanceHelp: payload.localAssistanceHelp === true,
          assistanceContactName: typeof payload.contactName === "string" ? payload.contactName : null,
          assistanceContactPhone: typeof payload.phone === "string" ? payload.phone : null,
          assistanceContactEmail: ownerEmail || null,
        },
      });
      if (ownerEmail) {
        const user = await db.user.findUnique({ where: { email: ownerEmail }, select: { id: true } });
        await db.pharmacyMember.upsert({
          where: { pharmacyNpi_email: { pharmacyNpi: claim.pharmacyNpi, email: ownerEmail } },
          update: { status: "active", role: "OWNER", userId: user?.id ?? undefined },
          create: { pharmacyNpi: claim.pharmacyNpi, email: ownerEmail, role: "OWNER", status: "active", userId: user?.id },
        });
      }
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

