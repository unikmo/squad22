import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "../../lib/ipn-db";
import { stripe } from "../../lib/ipn-stripe";

const PAYMENT_INTENT_EVENTS = new Set<Stripe.Event.Type>([
  "payment_intent.amount_capturable_updated",
  "payment_intent.canceled",
  "payment_intent.payment_failed",
  "payment_intent.succeeded",
]);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 400 });
  try {
    const event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
    if (PAYMENT_INTENT_EVENTS.has(event.type)) {
      const intent = event.data.object as Stripe.PaymentIntent;
      const reservation = await db.reservation.findUnique({ where: { stripePaymentIntentId: intent.id }, select: { id: true, reservationFeeStatus: true } });
      if (reservation) {
        const data = event.type === "payment_intent.succeeded"
          ? { reservationFeeStatus: "charged", stripePaymentStatus: intent.status, stripeCapturedAt: new Date(), paymentFailureReason: null }
          : event.type === "payment_intent.canceled"
            ? { reservationFeeStatus: "released", stripePaymentStatus: intent.status, stripeCanceledAt: new Date(), paymentFailureReason: null }
            : { stripePaymentStatus: intent.status };
        await db.reservation.update({ where: { id: reservation.id }, data });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, { status: 400 });
  }
}
