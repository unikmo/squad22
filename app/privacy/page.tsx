import type { Metadata } from "next";
import { PublicPage } from "../lib/public-page";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() { return <PublicPage><div className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-4xl font-black">Privacy</h1><p className="mt-5 leading-7 text-slate-600">IPNUS is preparing its full privacy policy before public launch. Do not submit sensitive medical information through general contact channels. Reservation contact details are provided to the selected pharmacy so it can respond to the request.</p></div></PublicPage>; }
