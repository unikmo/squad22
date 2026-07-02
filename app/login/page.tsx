import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "../lib/public-page";
export const metadata: Metadata = { title: "Sign In", robots: { index: false, follow: false } };
export default function LoginPage() { return <PublicPage><div className="mx-auto max-w-xl px-6 py-20"><h1 className="text-4xl font-black text-slate-950">Sign in to IPNUS</h1><p className="mt-4 text-slate-600">Account sign-in is coming soon. Pharmacies ready to claim a profile can contact the IPNUS launch team.</p><Link href="/contact" className="mt-7 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Contact IPNUS</Link></div></PublicPage>; }
