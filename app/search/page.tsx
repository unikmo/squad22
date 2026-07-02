import type { Metadata } from "next";
import { IPN_TOP300_DRUGS } from "../lib/ipn-drugs-top300";
import { PublicPage } from "../lib/public-page";
import { SearchFormClient } from "./search-form-client";

export const metadata: Metadata = { title: "Compare Prescription Cash Prices", description: "Search published prescription cash prices from participating independent pharmacies." };

export default function SearchPage() {
  const drugs = IPN_TOP300_DRUGS.map((drug) => ({ name: drug.canonicalGenericName }));
  return <PublicPage><div className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-4xl font-black tracking-tight text-slate-950">Compare prescription cash prices</h1><p className="mt-3 text-lg text-slate-600">Search published cash prices from participating independent pharmacies. ZIP is optional while distance filtering is being built.</p><div className="mt-8"><SearchFormClient drugs={drugs} /></div></div></PublicPage>;
}
