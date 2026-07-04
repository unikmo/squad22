import { NextResponse } from "next/server";
import { db } from "../../lib/ipn-db";
import type { Prisma } from "@prisma/client";
import { calculateEarnedPoints, calculatePharmacyFundingCents } from "../../lib/ipn-rewards";
import { canManagePharmacy } from "../../lib/ipn-authorization";
import { captureNoShowFee, releaseReservationAuthorization } from "../../lib/ipn-reservation-fees";

const getString = (form: FormData, key: string) => typeof form.get(key) === "string" ? String(form.get(key)) : "";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const reservationId = getString(form, "reservationId").trim();
    const action = getString(form, "action").trim();
    const allowed = new Set(["PHARMACY_CONFIRMED", "READY_FOR_PICKUP", "COMPLETED", "DECLINED_BY_PHARMACY", "NO_SHOW"]);
    if (!reservationId || !allowed.has(action)) return NextResponse.json({ error: "Invalid reservation action" }, { status: 400 });

    const reservation = await db.reservation.findUnique({ where: { id: reservationId }, include: { pharmacy: true } });
    if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    const access = await canManagePharmacy(reservation.pharmacyNpi);
    if (!access.allowed) return NextResponse.json({ error: access.reason === "unauthenticated" ? "Authentication required" : "Forbidden" }, { status: access.reason === "unauthenticated" ? 401 : 403 });

    if (action === "COMPLETED") {
      const actualPurchase = Number(getString(form, "actualPurchase"));
      if (!Number.isFinite(actualPurchase) || actualPurchase < 0) return NextResponse.json({ error: "A valid final purchase total is required" }, { status: 400 });
      const actualPurchaseCents = Math.round(actualPurchase * 100);
      const pointsEarned = calculateEarnedPoints(actualPurchaseCents);
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.reservation.update({ where: { id: reservation.id }, data: { status: action, actualPurchaseCents, completedAt: new Date(), rewardPointsEstimated: pointsEarned, rewardStatus: reservation.patientId && reservation.pharmacy.rewardsEnabled ? "earned" : "ineligible" } });
        if (reservation.patientId && reservation.pharmacy.rewardsEnabled && pointsEarned > 0) {
          await tx.rewardTransaction.upsert({ where: { reservationId_type: { reservationId: reservation.id, type: "earned" } }, update: {}, create: { userId: reservation.patientId, pharmacyNpi: reservation.pharmacyNpi, reservationId: reservation.id, type: "earned", points: pointsEarned, eligibleSpendCents: actualPurchaseCents, fundingCents: calculatePharmacyFundingCents(actualPurchaseCents), description: "Points earned after confirmed purchase" } });
        }
      });
      await releaseReservationAuthorization(reservation.id);
    } else if (action === "NO_SHOW") {
      if (!reservation.noShowEligibleAt || reservation.noShowEligibleAt > new Date()) {
        return NextResponse.json({ error: "The $5 no-show fee is not eligible until 48 hours after reservation" }, { status: 400 });
      }
      await captureNoShowFee(reservation.id);
      if (reservation.patientId && reservation.pointsRedeemed > 0) {
        await db.rewardTransaction.upsert({ where: { reservationId_type: { reservationId: reservation.id, type: "reversed" } }, update: {}, create: { userId: reservation.patientId, pharmacyNpi: reservation.pharmacyNpi, reservationId: reservation.id, type: "reversed", points: reservation.pointsRedeemed, description: "Points returned after unfulfilled reservation" } });
      }
    } else if (action === "DECLINED_BY_PHARMACY") {
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.reservation.update({ where: { id: reservation.id }, data: { status: action, rewardStatus: "cancelled" } });
        if (reservation.patientId && reservation.pointsRedeemed > 0) {
          await tx.rewardTransaction.upsert({ where: { reservationId_type: { reservationId: reservation.id, type: "reversed" } }, update: {}, create: { userId: reservation.patientId, pharmacyNpi: reservation.pharmacyNpi, reservationId: reservation.id, type: "reversed", points: reservation.pointsRedeemed, description: "Points returned after unfulfilled reservation" } });
        }
      });
      await releaseReservationAuthorization(reservation.id);
    } else {
      await db.reservation.update({ where: { id: reservation.id }, data: { status: action } });
    }
    return NextResponse.redirect(new URL(`/pharmacy-dashboard/${encodeURIComponent(reservation.pharmacyNpi)}`, req.url), 303);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
