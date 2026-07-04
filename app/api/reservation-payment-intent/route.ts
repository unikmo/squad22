import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { stripe } from "../../lib/ipn-stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Sign in is required" }, { status: 401 });
  try {
    const intent = await stripe().paymentIntents.create({
      amount: 500,
      currency: "usd",
      capture_method: "manual",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: session.user.email,
      description: "IPNUS reservation no-show authorization",
      metadata: { ipnusUserId: session.user.id, purpose: "reservation_no_show_fee" },
    });
    return NextResponse.json({ paymentIntentId: intent.id, clientSecret: intent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create payment authorization" }, { status: 500 });
  }
}
