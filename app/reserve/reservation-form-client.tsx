"use client";

import { useMemo, useState } from "react";

type Props = {
  pharmacy: { npi: string; deliveryEnabled: boolean };
  drug: string;
  strength: string;
  quantity: number;
  zip: string;
  productType: string;
};

export function ReservationFormClient({ pharmacy, drug, strength, quantity, zip, productType }: Props) {
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState({ line: "", city: "", state: "", zip: "" });
  const deliveryAddress = useMemo(() => fulfillment === "local_delivery" ? JSON.stringify(address) : "", [address, fulfillment]);
  const isPrescription = productType !== "otc";

  return <form action="/api/reservation-submissions" method="post" className="mt-8 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <input type="hidden" name="npi" value={pharmacy.npi} /><input type="hidden" name="drug" value={drug} /><input type="hidden" name="strength" value={strength} /><input type="hidden" name="quantity" value={quantity} /><input type="hidden" name="zip" value={zip} /><input type="hidden" name="fulfillmentMethod" value={fulfillment} /><input type="hidden" name="deliveryAddress" value={deliveryAddress} />
    <div><h2 className="text-xl font-black text-slate-950">Enter your contact details</h2><p className="mt-1 text-sm text-slate-600">The pharmacy uses this to confirm your reservation request.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" required /><Field label="Last name" name="lastName" required /><Field label="Phone" name="phone" type="tel" required /><Field label="Email" name="email" type="email" required />
    </div>
    <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold text-slate-900">Pickup or delivery</legend><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} /> Pickup</label>{pharmacy.deliveryEnabled ? <label className="flex items-center gap-2"><input type="radio" checked={fulfillment === "local_delivery"} onChange={() => setFulfillment("local_delivery")} /> Local delivery</label> : null}</div>{fulfillment === "local_delivery" ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><ControlledField label="Street / address line" value={address.line} onChange={(line) => setAddress({ ...address, line })} wide /><ControlledField label="City" value={address.city} onChange={(city) => setAddress({ ...address, city })} /><ControlledField label="State" value={address.state} onChange={(state) => setAddress({ ...address, state })} /><ControlledField label="ZIP" value={address.zip} onChange={(postal) => setAddress({ ...address, zip: postal })} /></div> : null}</fieldset>
    {isPrescription ? <fieldset className="rounded-xl border border-slate-200 p-4"><legend className="px-2 font-bold text-slate-900">Prescription confirmation</legend><p className="mb-4 text-sm text-slate-600">A valid prescription is still required. Select the option that applies.</p><div className="grid gap-3"><label className="flex items-start gap-3"><input type="checkbox" name="rxOnFile" value="true" className="mt-1" /><span>Prescription is on file at this pharmacy</span></label><label className="flex items-start gap-3"><input type="checkbox" name="rxUploadAcknowledged" value="true" className="mt-1" /><span>I understand the pharmacy must verify my prescription before fulfillment</span></label></div></fieldset> : null}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Referral code (optional)" name="referralCode" /><Field label="Doctor name (optional)" name="doctorName" /></div>
    <label className="font-semibold text-slate-800">Notes to pharmacy (optional)<textarea name="notes" rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>
    <button type="submit" className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800">Send Reservation Request</button>
    <p className="text-xs text-slate-500">Submitting a request does not guarantee fulfillment. The pharmacy will contact you to confirm.</p>
  </form>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="font-semibold text-slate-800">{label}<input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>; }
function ControlledField({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={`font-semibold text-slate-800 ${wide ? "sm:col-span-2" : ""}`}>{label}<input value={value} onChange={(event) => onChange(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600" /></label>; }
