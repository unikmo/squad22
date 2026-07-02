import type { Metadata } from "next";
import Link from "next/link";
import { db } from "../lib/ipn-db";
import { PublicPage } from "../lib/public-page";
import { ReservationFormClient } from "./reservation-form-client";

export const metadata: Metadata = { title: "Reserve a Published Cash Price", robots: { index: false, follow: false } };
type Query = Record<string, string | string[] | undefined>;
const value = (query: Query, key: string) => typeof query[key] === "string" ? query[key] : "";

export default async function ReservePage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const pharmacyNpi = value(query, "pharmacyNpi").trim();
  const drug = value(query, "drug").trim();
  const strength = value(query, "strength").trim();
  const zip = value(query, "zip").trim();
  const quantity = Math.max(1, Number(value(query, "quantity")) || 30);
  const resultsHref = `/results?${new URLSearchParams({ drug, strength, quantity: String(quantity), zip })}`;

  const pharmacy = pharmacyNpi ? await db.pharmacy.findUnique({ where: { npi: pharmacyNpi } }) : null;
  const drugPrice = pharmacy ? await db.drugPrice.findFirst({
    where: { pharmacyNpi, drugName: drug, strength, quantity, status: "active" },
    orderBy: { cashPriceCents: "asc" },
  }) : null;

  if (!pharmacy || !drugPrice || !pharmacy.reservationsEnabled) {
    return <PublicPage><div className="mx-auto max-w-2xl px-6 py-20"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-8"><h1 className="text-3xl font-black text-slate-950">This price is no longer available.</h1><p className="mt-3 text-slate-600">Return to the results to review currently published prices and reservation options.</p><Link href={resultsHref} className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Back to results</Link></div></div></PublicPage>;
  }

  return <PublicPage><div className="mx-auto max-w-3xl px-6 py-14">
    <h1 className="text-4xl font-black tracking-tight text-slate-950">Reserve this published cash price</h1>
    <p className="mt-3 text-slate-600">The pharmacy will confirm availability, prescription requirements, and pickup or delivery details.</p>
    <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="font-black text-slate-950">{pharmacy.name}</p><p className="mt-1 text-slate-600">{pharmacy.address1}, {pharmacy.city}, {pharmacy.state} {pharmacy.zip}</p><div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-slate-600">{drug} · {strength} · quantity {quantity}</p><p className="text-sm text-slate-500">Published cash price</p></div><p className="text-3xl font-black text-emerald-800">${(drugPrice.cashPriceCents / 100).toFixed(2)}</p></div></div>
    <ReservationFormClient pharmacy={{ npi: pharmacy.npi, deliveryEnabled: pharmacy.deliveryEnabled }} drug={drug} strength={strength} quantity={quantity} zip={zip} productType={drugPrice.productType} />
    <Link href={resultsHref} className="mt-6 inline-block font-semibold text-emerald-700">← Back to results</Link>
  </div></PublicPage>;
}
