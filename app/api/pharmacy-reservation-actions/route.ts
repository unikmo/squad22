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
    const reservationId = getString(form, "reservationId").trim();
    const action = getString(form, "action").trim();

    if (!reservationId) return NextResponse.json({ error: "Missing reservationId" }, { status: 400 });
    if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

    const allowed = new Set([
      "PHARMACY_CONFIRMED",
      "READY_FOR_PICKUP",
      "COMPLETED",
      "DECLINED_BY_PHARMACY",
      "NO_SHOW",
    ]);

    if (!allowed.has(action)) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true },
    });

    if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    await db.reservation.update({
      where: { id: reservationId },
      data: { status: action },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

