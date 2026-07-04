import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { stripe } from "../../../lib/ipn-stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in is required" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as { paymentIntentId?: string };
  if (!body.paymentIntentId) return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
  try {
    const intent = await stripe().paymentIntents.retrieve(body.paymentIntentId);
    if (intent.metadata.ipnusUserId !== session.user.id || intent.metadata.purpose !== "reservation_no_show_fee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["succeeded", "canceled"].includes(intent.status)) await stripe().paymentIntents.cancel(intent.id);
    return NextResponse.json({ canceled: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to cancel authorization" }, { status: 400 });
  }
}
