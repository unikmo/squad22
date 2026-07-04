import type { Metadata } from "next";
import Link from "next/link";
import { IPN_TOP300_DRUGS } from "./lib/ipn-drugs-top300";
import { PublicPage } from "./lib/public-page";
import { SearchFormClient } from "./search/search-form-client";

export const metadata: Metadata = {
  title: "IPNUS | Low Cash Prescription Prices from Independent Pharmacies",
  description: "Search low cash prescription prices from participating independent pharmacies near you. Compare published prices, skip coupon cards, support local pharmacies, and check assistance options.",
  keywords: ["low cash prescription prices", "independent pharmacies near me", "prescription assistance", "help paying for medication", "no coupon card prescription prices", "local pharmacy prescription prices"],
};

const drugs = IPN_TOP300_DRUGS.map((drug) => ({ name: drug.canonicalGenericName }));
const steps = [
  ["1", "Search your medication", "Enter your medication, strength, quantity, and ZIP."],
  ["2", "Compare published cash prices", "See prices from participating independent pharmacies."],
  ["3", "Reserve directly", "Send a reservation request so the pharmacy can confirm availability, prescription requirements, and pickup or delivery options."],
];

export default function Home() {
  return <PublicPage>
    <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50"><div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div><p className="font-bold uppercase tracking-widest text-emerald-700">Local prices. Clear choices.</p><h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">Find low cash prescription prices from independent pharmacies near you.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Compare published pharmacy prices, skip coupon cards, support local independents, and check if assistance options may be available.</p><Link href="#price-search" className="mt-8 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800">Find Prices</Link><ul className="mt-7 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2"><li>✓ Low cash prices</li><li>✓ No coupon cards</li><li>✓ Local independent pharmacies</li><li>✓ Assistance options check</li></ul></div>
      <div id="price-search"><SearchFormClient drugs={drugs} /></div>
    </div></section>

    <section className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-black text-slate-950">How IPNUS works</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Search your medication, compare published cash prices from participating independent pharmacies, and send a reservation request directly to the pharmacy.</p><div className="mt-10 grid gap-6 md:grid-cols-3">{steps.map(([number, title, copy]) => <div key={number} className="rounded-2xl border border-slate-200 p-6"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-800">{number}</span><h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3><p className="mt-2 text-slate-600">{copy}</p></div>)}</div></section>

    <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-black text-slate-950">Prescription cash prices can vary by pharmacy.</h2><p className="mt-4 max-w-3xl leading-7 text-slate-600">The same medication may have different cash prices at different pharmacies. IPNUS helps you compare published prices before you call, drive, or overpay.</p></div></section>

    <section className="mx-auto max-w-7xl px-6 py-20"><div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 md:p-12"><p className="font-bold uppercase tracking-widest text-amber-800">Assistance options</p><h2 className="mt-3 text-3xl font-black text-slate-950">Cash price still too high?</h2><p className="mt-4 max-w-3xl leading-7 text-slate-700">Some patients may qualify for manufacturer assistance, foundation support, public programs, or local pharmacy help. IPNUS helps surface what to ask about before you give up on a medication.</p><Link href="/assistance" className="mt-7 inline-block rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Learn About Assistance Options</Link></div></section>

    <section className="bg-emerald-900 text-white"><div className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-black">For independent pharmacies</h2><p className="mt-4 max-w-3xl leading-7 text-emerald-50">Publish cash prices, receive reservation requests, and help patients discover assistance options when medication is still hard to afford.</p><Link href="/claim" className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-bold text-emerald-900">Claim Your Pharmacy</Link></div></section>

    <section className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-black text-slate-950">Questions before you search?</h2><p className="mt-3 max-w-2xl text-slate-600">Prices are published by participating pharmacies and may require confirmation before pickup, delivery, or prescription fulfillment.</p><Link href="/faq" className="mt-5 inline-block font-bold text-emerald-700 hover:underline">Read FAQ →</Link></section>
  </PublicPage>;
}
