import type { Metadata } from "next";
import { PublicPage } from "../lib/public-page";
export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() { return <PublicPage><div className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-4xl font-black">Terms</h1><p className="mt-5 leading-7 text-slate-600">IPNUS provides pharmacy-published cash-price information and reservation-request tools. Prices, availability, prescription requirements, pickup, and delivery remain subject to confirmation by the participating pharmacy.</p></div></PublicPage>; }
