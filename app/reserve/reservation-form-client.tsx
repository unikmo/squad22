"use client";

import { FormEvent, useMemo, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type Props = {
  pharmacy: { npi: string; deliveryEnabled: boolean; rewardsEnabled: boolean };
  drug: string;
  strength: string;
  quantity: number;
  zip: string;
  productType: string;
  email: string;
  availablePoints: number;
  priceCents: number;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function ReservationFormClient(props: Props) {
  if (!stripePromise) return <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Reservation payments are temporarily unavailable.</div>;
  return <Elements stripe={stripePromise}><ReservationForm {...props} /></Elements>;
}

function ReservationForm({ pharmacy, drug, strength, quantity, zip, productType, email, availablePoints, priceCents }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState({ line: "", city: "", state: "", zip: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const deliveryAddress = useMemo(() => fulfillment === "local_delivery" ? JSON.stringify(address) : "", [address, fulfillment]);
  const isPrescription = productType !== "otc";

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reservationData = new FormData(event.currentTarget);
    const card = elements?.getElement(CardElement);
    if (!stripe || !card) return setError("Secure card entry is still loading. Please try again.");
    setSubmitting(true);
    setError("");
    let paymentIntentId = "";
    try {
      const intentResponse = await fetch("/api/reservation-payment-intent", { method: "POST" });
      const intentBody = await intentResponse.json() as { clientSecret?: string; paymentIntentId?: string; error?: string };
      if (!intentResponse.ok || !intentBody.clientSecret || !intentBody.paymentIntentId) throw new Error(intentBody.error ?? "Unable to prepare the $5 no-show authorization");
      paymentIntentId = intentBody.paymentIntentId;
      const firstName = String(reservationData.get("firstName") ?? "");
      const lastName = String(reservationData.get("lastName") ?? "");
      const confirmation = await stripe.confirmCardPayment(intentBody.clientSecret, { payment_method: { card, billing_details: { name: `${firstName} ${lastName}`.trim(), email } } });
      if (confirmation.error) throw new Error(confirmation.error.message ?? "Card authorization failed");
      if (confirmation.paymentIntent?.status !== "requires_capture") throw new Error("The card authorization was not completed");
      reservationData.set("stripePaymentIntentId", paymentIntentId);
      const reservationResponse = await fetch("/api/reservation-submissions", { method: "POST", body: reservationData });
      if (!reservationResponse.ok) {
        const body = await reservationResponse.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Reservation submission failed");
      }
      window.location.assign(reservationResponse.url);
    } catch (caught) {
      if (paymentIntentId) await fetch("/api/reservation-payment-intent/cancel", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ paymentIntentId }) }).catch(() => undefined);
      setError(caught instanceof Error ? caught.message : "Unable to submit reservation");
      setSubmitting(false);
    }
  }

  return <form onSubmit={submitReservation} className="mt-8 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <input type="hidden" name="npi" value={pharmacy.npi} /><input type="hidden" name="drug" value={drug} /><input type="hidden" name="strength" value={strength} /><input type="hidden" name="quantity" value={quantity} /><input type="hidden" name="zip" value={zip} /><input type="hidden" name="fulfillmentMethod" value={fulfillment} /><input type="hidden" name="deliveryAddress" value={deliveryAddress} />
    <div><h2 className="text-xl font-black text-slate-950">Enter your contact details</h2><p className="mt-1 text-sm text-slate-600">The pharmacy uses this to confirm your reservation request.</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" required /><Field label="Last name" name="lastName" required /><Field label="Phone" name="phone" type="tel" required /><label className="font-semibold text-slate-800">Email<input name="email" type="email" readOnly value={email} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-normal" /></label></div>
    <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold text-slate-900">Pickup or delivery</legend><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} /> Pickup</label>{pharmacy.deliveryEnabled ? <label className="flex items-center gap-2"><input type="radio" checked={fulfillment === "local_delivery"} onChange={() => setFulfillment("local_delivery")} /> Local delivery</label> : null}</div>{fulfillment === "local_delivery" ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><ControlledField label="Street / address line" value={address.line} onChange={(line) => setAddress({ ...address, line })} wide /><ControlledField label="City" value={address.city} onChange={(city) => setAddress({ ...address, city })} /><ControlledField label="State" value={address.state} onChange={(state) => setAddress({ ...address, state })} /><ControlledField label="ZIP" value={address.zip} onChange={(postal) => setAddress({ ...address, zip: postal })} /></div> : null}</fieldset>
    {isPrescription ? <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold text-slate-900">Prescription confirmation</legend><p className="mb-4 text-sm text-slate-600">A valid prescription is still required. Select the option that applies.</p><div className="grid gap-3"><label className="flex items-start gap-3"><input type="checkbox" name="rxOnFile" value="true" className="mt-1" /><span>Prescription is on file at this pharmacy</span></label><label className="flex items-start gap-3"><input type="checkbox" name="rxUploadAcknowledged" value="true" className="mt-1" /><span>I understand the pharmacy must verify my prescription before fulfillment</span></label></div></fieldset> : null}
    {pharmacy.rewardsEnabled && availablePoints >= 100 ? <label className="font-semibold text-slate-800">Redeem IP Points (optional)<input name="pointsRedeemed" type="number" min={0} max={Math.min(Math.floor(availablePoints / 100) * 100, Math.floor(priceCents / 100) * 100)} step={100} defaultValue={0} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Balance: {availablePoints.toLocaleString()} points · Redeem in increments of 100 points.</span></label> : null}
    <fieldset className="rounded-xl border border-amber-200 bg-amber-50 p-4"><legend className="px-2 font-bold text-slate-900">Need help paying?</legend><p className="mb-4 text-sm text-slate-700">If this medication is still difficult to afford, the pharmacy may be able to discuss manufacturer assistance, foundation support, public programs, or local options.</p><label className="flex items-start gap-3 font-semibold text-slate-800"><input type="checkbox" name="assistanceRequested" value="true" className="mt-1" /><span>Ask this pharmacy about assistance options</span></label></fieldset>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Referral code (optional)" name="referralCode" /><Field label="Doctor name (optional)" name="doctorName" /></div>
    <label className="font-semibold text-slate-800">Notes to pharmacy (optional)<textarea name="notes" rows={3} placeholder="Tell the pharmacy anything helpful, such as uninsured status, high copay, or affordability concerns." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>
    <fieldset className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><legend className="px-2 font-bold text-slate-900">$5 no-show authorization</legend><p className="mb-4 text-sm text-slate-700">Your card is authorized for $5 now but is not charged. IPNUS releases the authorization when the pharmacy records pickup or declines the request. The $5 goes to IPNUS only if the medication is not picked up after 48 hours.</p><div className="rounded-lg border border-slate-300 bg-white px-4 py-4"><CardElement options={{ hidePostalCode: false }} /></div></fieldset>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}
    <button type="submit" disabled={submitting || !stripe} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Authorizing and reserving…" : "Authorize $5 and Send Reservation Request"}</button>
    <p className="text-xs text-slate-500">Submitting a request does not guarantee fulfillment. The pharmacy will contact you to confirm.</p>
  </form>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="font-semibold text-slate-800">{label}<input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>; }
function ControlledField({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={`font-semibold text-slate-800 ${wide ? "sm:col-span-2" : ""}`}>{label}<input value={value} onChange={(event) => onChange(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>; }
