import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "../../auth";
import { PublicPage } from "../lib/public-page";

export const metadata: Metadata = { title: "Sign In", robots: { index: false, follow: false } };
type Query = Record<string, string | string[] | undefined>;

export default async function LoginPage({ searchParams }: { searchParams: Promise<Query> }) {
  const session = await auth();
  const query = await searchParams;
  const callbackUrl = typeof query.callbackUrl === "string" && query.callbackUrl.startsWith("/") ? query.callbackUrl : "/rewards";
  if (session?.user) redirect(callbackUrl);
  return <PublicPage><div className="mx-auto max-w-xl px-6 py-20"><h1 className="text-4xl font-black text-slate-950">Sign in to IPNUS</h1><p className="mt-4 text-slate-600">Enter your email to receive a secure sign-in link. No password required.</p><form className="mt-8 grid gap-4 rounded-2xl border border-slate-200 p-6" action={async (formData) => { "use server"; const email = String(formData.get("email") ?? "").trim().toLowerCase(); if (!email) return; await signIn("resend", { email, redirectTo: callbackUrl }); }}><label className="font-bold text-slate-800">Email address<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label><button className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">Email me a sign-in link</button></form></div></PublicPage>;
}
