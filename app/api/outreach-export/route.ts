import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";

function csvEscape(v: unknown) {
  const s = (v ?? "").toString();
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const pharmacies = await db.pharmacy.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      npi: true,
      name: true,
      address1: true,
      city: true,
      state: true,
      zip: true,
      phone: true,
      email: true,
      website: true,
      outreachStatus: true,
      enrichmentStatus: true,
      claimInvites: {
        where: {
          status: "active",
        },
        take: 1,
        select: { token: true },
      },
    },
  });

  const header = [
    "npi",
    "pharmacyName",
    "address",
    "city",
    "state",
    "zip",
    "phone",
    "email",
    "website",
    "outreachStatus",
    "enrichmentStatus",
    "inviteToken",
    "claimUrl",
  ];

  const lines: string[] = [];
  lines.push(header.join(","));

  for (const p of pharmacies) {
    const activeInviteToken = p.claimInvites[0]?.token ?? "";
    const claimUrl = activeInviteToken
      ? `/claim-invite/${encodeURIComponent(activeInviteToken)}`
      : "";

    lines.push(
      [
        p.npi,
        p.name,
        p.address1,
        p.city,
        p.state,
        p.zip,
        p.phone,
        p.email ?? "",
        p.website ?? "",
        p.outreachStatus,
        p.enrichmentStatus,
        activeInviteToken,
        claimUrl,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="outreach-export.csv"',
    },
  });
}

