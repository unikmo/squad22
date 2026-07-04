import type { Metadata } from "next";
import { PublicPage } from "../../lib/public-page";
export const metadata: Metadata = { title: "Check Your Email", robots: { index: false, follow: false } };
export default function CheckEmailPage() { return <PublicPage><div className="mx-auto max-w-xl px-6 py-20"><h1 className="text-4xl font-black text-slate-950">Check your email</h1><p className="mt-4 text-slate-600">We sent you a secure IPNUS sign-in link. The link expires automatically.</p></div></PublicPage>; }
