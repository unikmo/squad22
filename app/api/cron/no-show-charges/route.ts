import { NextResponse } from "next/server";
import { db } from "../../../lib/ipn-db";
import { captureNoShowFee } from "../../../lib/ipn-reservation-fees";

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const due = await db.reservation.findMany({ where: { reservationFeeStatus: "authorized", noShowEligibleAt: { lte: now }, status: { in: ["pending", "PHARMACY_CONFIRMED", "READY_FOR_PICKUP"] } }, select: { id: true }, take: 100 });
  const results: Array<{ id: string; status: "charged" | "failed"; error?: string }> = [];
  for (const reservation of due) {
    try { await captureNoShowFee(reservation.id, now); results.push({ id: reservation.id, status: "charged" }); }
    catch (error) { results.push({ id: reservation.id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" }); }
  }
  return NextResponse.json({ processed: results.length, results });
}

export const GET = POST;
