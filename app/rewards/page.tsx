import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { db } from "../lib/ipn-db";
import { PublicPage } from "../lib/public-page";

export const metadata: Metadata = { title: "IP Rewards", robots: { index: false, follow: false } };
export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/rewards");
  const transactions = await db.rewardTransaction.findMany({ where: { userId: session.user.id }, include: { pharmacy: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  const balance = transactions.reduce((total, transaction) => total + transaction.points, 0);
  return <PublicPage><div className="mx-auto max-w-4xl px-6 py-16"><p className="font-bold uppercase tracking-wider text-emerald-700">IP Rewards</p><h1 className="mt-2 text-5xl font-black text-slate-950">{balance.toLocaleString()} IP Points</h1><p className="mt-3 text-slate-600">Earn 1 IP Point for every $1 spent after an eligible purchase is confirmed. Redeem points across participating IPNUS pharmacies.</p><div className="mt-10 overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Activity</th><th className="p-4">Pharmacy</th><th className="p-4 text-right">Points</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id} className="border-t border-slate-200"><td className="p-4"><strong className="capitalize">{transaction.type}</strong><span className="block text-xs text-slate-500">{transaction.createdAt.toLocaleDateString()}</span></td><td className="p-4">{transaction.pharmacy.name}</td><td className={`p-4 text-right font-black ${transaction.points >= 0 ? "text-emerald-700" : "text-slate-900"}`}>{transaction.points > 0 ? "+" : ""}{transaction.points}</td></tr>)}{transactions.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-slate-500">No rewards activity yet.</td></tr> : null}</tbody></table></div></div></PublicPage>;
}
