import "server-only";
import { db } from "./ipn-db";
import { stripe } from "./ipn-stripe";

export async function releaseReservationAuthorization(reservationId: string) {
  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation?.stripePaymentIntentId || reservation.reservationFeeStatus !== "authorized") return;
  const intent = await stripe().paymentIntents.retrieve(reservation.stripePaymentIntentId);
  if (intent.status === "requires_capture" || intent.status === "requires_payment_method" || intent.status === "requires_confirmation" || intent.status === "requires_action" || intent.status === "processing") {
    await stripe().paymentIntents.cancel(intent.id);
  }
  await db.reservation.update({ where: { id: reservation.id }, data: { reservationFeeStatus: "released", stripePaymentStatus: "canceled", stripeCanceledAt: new Date(), paymentFailureReason: null } });
}

export async function captureNoShowFee(reservationId: string, now = new Date()) {
  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation?.stripePaymentIntentId) throw new Error("Reservation has no payment authorization");
  if (reservation.reservationFeeStatus === "charged") return reservation;
  if (!reservation.noShowEligibleAt || reservation.noShowEligibleAt > now) throw new Error("The $5 no-show fee is not eligible until 48 hours after reservation");
  try {
    const intent = await stripe().paymentIntents.retrieve(reservation.stripePaymentIntentId);
    const captured = intent.status === "requires_capture" ? await stripe().paymentIntents.capture(intent.id, { amount_to_capture: reservation.reservationFeeCents }) : intent;
    if (captured.status !== "succeeded") throw new Error(`Stripe PaymentIntent is ${captured.status}, not succeeded`);
    return db.reservation.update({ where: { id: reservation.id }, data: { status: "NO_SHOW", reservationFeeStatus: "charged", stripePaymentStatus: captured.status, stripeCapturedAt: new Date(), paymentFailureReason: null, rewardStatus: "cancelled" } });
  } catch (error) {
    await db.reservation.update({ where: { id: reservation.id }, data: { reservationFeeStatus: "charge_failed", paymentFailureReason: error instanceof Error ? error.message.slice(0, 500) : "Unknown Stripe capture error" } });
    throw error;
  }
}
