import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../lib/ipn-db";
import { PublicPage } from "../../lib/public-page";

export const metadata: Metadata = { title: "Pharmacy Profile" };
export default async function PharmacyProfilePage({ params }: { params: Promise<{ npi: string }> }) {
  const { npi } = await params;
  const pharmacy = await db.pharmacy.findUnique({ where: { npi } });
  if (!pharmacy) notFound();
  const claimed = pharmacy.profileStatus === "claimed";
  return <PublicPage><div className="mx-auto max-w-3xl px-6 py-14"><p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Independent pharmacy profile</p><h1 className="mt-2 text-4xl font-black text-slate-950">{pharmacy.name}</h1><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Independent pharmacy</span><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{claimed ? "Claimed profile" : "Profile not claimed"}</span>{pharmacy.pricingPublished ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Cash prices published</span> : null}{pharmacy.reservationsEnabled ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Reservations available</span> : null}{pharmacy.deliveryEnabled ? <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">Delivery available</span> : null}</div><div className="mt-8 rounded-2xl border border-slate-200 p-6"><h2 className="text-lg font-black">Contact details</h2><address className="mt-3 not-italic leading-7 text-slate-600">{pharmacy.address1}{pharmacy.address2 ? <><br />{pharmacy.address2}</> : null}<br />{pharmacy.city}, {pharmacy.state} {pharmacy.zip}</address><a href={`tel:${pharmacy.phone}`} className="mt-3 inline-block font-bold text-emerald-700">{pharmacy.phone}</a></div>{!claimed ? <div className="mt-6 rounded-2xl bg-emerald-50 p-6"><h2 className="text-xl font-black">Own or manage this pharmacy?</h2><p className="mt-2 text-slate-600">Claim the profile to publish cash prices and receive reservation requests.</p><Link href={`/claim/${encodeURIComponent(npi)}`} className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Claim This Pharmacy</Link></div> : null}</div></PublicPage>;
}
