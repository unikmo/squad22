import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "../lib/public-page";

export const metadata: Metadata = {
  title: "Medication Assistance Options | IPNUS",
  description: "Learn about manufacturer assistance, charitable foundation support, public programs, and local pharmacy help that may reduce prescription medication costs.",
  keywords: ["prescription assistance", "help paying for medication", "manufacturer assistance program", "patient assistance programs", "copay assistance foundation"],
};

const categories = [
  ["Manufacturer Assistance", "Some drug manufacturers offer free or discounted medications to eligible uninsured or underinsured patients."],
  ["Foundation Assistance", "Independent charitable foundations may help eligible patients with copays, coinsurance, deductibles, or medication costs for certain diseases."],
  ["Public Programs", "Medicare, Medicaid, state, or county programs may help eligible patients access coverage or reduce medication costs."],
  ["Local Pharmacy Assistance", "Some independent pharmacies may know local hardship funds, charity partners, church-supported help, or county programs."],
];

export default function AssistancePage() {
  return <PublicPage><main className="mx-auto max-w-6xl px-6 py-16">
    <p className="font-bold uppercase tracking-widest text-emerald-700">Medication Assistance Options</p>
    <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight text-slate-950">Need help paying for medication?</h1>
    <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">Some patients may qualify for manufacturer assistance, foundation support, public programs, or local pharmacy help. IPNUS helps you know what to ask about when comparing cash prices.</p>

    <div className="mt-12 grid gap-6 md:grid-cols-2">{categories.map(([title, copy]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-3 leading-7 text-slate-600">{copy}</p></section>)}</div>

    <section className="mt-12 rounded-2xl bg-emerald-50 p-8"><h2 className="text-2xl font-black text-slate-950">What to ask your pharmacy</h2><ul className="mt-4 grid gap-3 text-slate-700"><li>• Do you help patients explore manufacturer assistance programs?</li><li>• Are there foundations or public programs relevant to this medication or condition?</li><li>• Do you know of local hardship funds or community assistance?</li><li>• What documents might a program provider require?</li></ul></section>

    <section className="mt-10"><h2 className="text-2xl font-black text-slate-950">Important eligibility note</h2><p className="mt-3 max-w-4xl leading-7 text-slate-600">Eligibility and availability vary by program, medication, insurance status, income, diagnosis, location, and other requirements. The pharmacy or program provider must confirm current details.</p></section>

    <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-slate-700"><strong>Disclaimer:</strong> IPNUS does not determine eligibility, guarantee approval, or submit assistance applications. Assistance programs are operated by manufacturers, foundations, government agencies, or local organizations. Availability and requirements vary.</div>
    <Link href="/search" className="mt-8 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">Search Published Prices</Link>
  </main></PublicPage>;
}
