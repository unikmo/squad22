import type { Metadata } from "next";
import Link from "next/link";
import { db } from "../lib/ipn-db";
import { PublicPage } from "../lib/public-page";

export const metadata: Metadata = {
  title: "Prescription Cash Price Results",
  description: "Compare published cash prices from participating independent pharmacies.",
};

type Query = Record<string, string | string[] | undefined>;
const getValue = (query: Query, key: string) =>
  typeof query[key] === "string" ? query[key] : "";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const drug = getValue(query, "drug").trim();
  const strength = getValue(query, "strength").trim();
  const zip = getValue(query, "zip").trim();
  const quantity = Math.max(1, Number(getValue(query, "quantity")) || 30);

  const rows = drug
    ? await db.drugPrice.findMany({
        where: { drugName: drug, strength, quantity, status: "active" },
        include: { pharmacy: true },
        orderBy: { cashPriceCents: "asc" },
      })
    : [];
  const results = [...new Map(rows.map((row) => [row.pharmacyNpi, row])).values()];

  return (
    <PublicPage>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Published cash prices</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Published cash prices near you</h1>
        {drug ? <p className="mt-2 text-lg font-semibold text-slate-800">{drug}{strength ? ` · ${strength}` : ""}</p> : null}
        <p className="mt-3 text-slate-600">Quantity: <strong>{quantity}</strong>{zip ? ` · ZIP: ${zip}` : ""}</p>

        {drug ? <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-xl font-black text-slate-950">Need help paying?</h2><p className="mt-2 text-slate-700">Cash price still too high? You may be able to ask about manufacturer assistance, foundation support, public programs, or local pharmacy help.</p><Link href="/assistance" className="mt-4 inline-block font-bold text-emerald-800 hover:underline">Check Assistance Options →</Link><p className="mt-3 text-xs text-slate-500">Eligibility and availability vary. The pharmacy or program provider must confirm details.</p></aside> : null}

        {results.length > 0 ? (
          <>
            <p className="mt-8 font-semibold text-slate-700">Sorted by lowest published cash price from participating pharmacies.</p>
            <div className="mt-5 grid gap-5">
              {results.map((row) => {
                const pharmacy = row.pharmacy;
                const reserveHref = `/reserve?${new URLSearchParams({ pharmacyNpi: pharmacy.npi, drug, strength, quantity: String(quantity), zip })}`;
                return (
                  <article key={pharmacy.npi} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-6 md:flex-row">
                      <div>
                        <h2 className="text-xl font-black text-slate-950"><Link href={`/pharmacy/${encodeURIComponent(pharmacy.npi)}`} className="hover:text-emerald-700">{pharmacy.name}</Link></h2>
                        <address className="mt-2 not-italic leading-6 text-slate-600">{pharmacy.address1}{pharmacy.address2 ? <><br />{pharmacy.address2}</> : null}<br />{pharmacy.city}, {pharmacy.state} {pharmacy.zip}</address>
                        <a href={`tel:${pharmacy.phone}`} className="mt-2 inline-block font-semibold text-emerald-700">{pharmacy.phone}</a>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Published pricing</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{row.productType === "otc" ? "OTC" : "Prescription"}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{pharmacy.profileStatus === "claimed" ? "Claimed profile" : "Profile not claimed"}</span>
                          {pharmacy.reservationsEnabled ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Reservations available</span> : null}
                          {pharmacy.deliveryEnabled ? <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">Delivery available</span> : null}
                          {pharmacy.assistanceSupportEnabled ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">✓ Helps with assistance options</span> : null}
                        </div>
                      </div>
                      <div className="md:text-right">
                        <p className="text-sm font-semibold text-slate-600">Published cash price</p>
                        <p className="mt-1 text-4xl font-black text-slate-950">${(row.cashPriceCents / 100).toFixed(2)}</p>
                        {pharmacy.reservationsEnabled ? <Link href={reserveHref} className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">Reserve this price</Link> : <a href={`tel:${pharmacy.phone}`} className="mt-4 inline-block rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Call pharmacy</a>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-black text-slate-950">No published price found for this exact search.</h2>
            <p className="mt-3 text-slate-600">Try a different strength or quantity, or check back as more independent pharmacies publish prices.</p>
            <Link href="/search" className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Start a new search</Link>
          </div>
        )}
        <p className="mt-8 text-sm text-slate-500">Prices are published by participating pharmacies and may require confirmation before pickup, delivery, or prescription fulfillment.</p>
      </div>
    </PublicPage>
  );
}
