import type { Metadata } from "next";
import Link from "next/link";
import { db } from "../../lib/ipn-db";
import { PublicPage } from "../../lib/public-page";

export const metadata: Metadata = { title: "Reservation Request Submitted", robots: { index: false, follow: false } };
type Query = Record<string, string | string[] | undefined>;
const value = (query: Query, key: string) => typeof query[key] === "string" ? query[key] : "";

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const reservationId = value(query, "reservationId");
  const requestedNumber = value(query, "reservationNumber");
  const reservation = reservationId ? await db.reservation.findUnique({ where: { id: reservationId }, include: { pharmacy: true } }) : null;
  const reservationNumber = reservation?.reservationNumber ?? requestedNumber;
  return <PublicPage><div className="mx-auto max-w-3xl px-6 py-16"><div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="font-bold uppercase tracking-wider text-emerald-700">Reservation request sent</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">The pharmacy will contact you to confirm.</h1><p className="mt-4 text-slate-600">Availability, prescription requirements, final price, and pickup or delivery details remain subject to pharmacy confirmation.</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Reservation number</p><p className="mt-1 font-mono font-bold text-slate-900">{reservationNumber || "Pending"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Status</p><p className="mt-1 font-bold capitalize text-slate-900">{reservation?.status ?? "pending"}</p></div></div>{reservation?.reservationFeeStatus === "authorized" ? <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700"><strong>$5 no-show authorization:</strong> Your card has not been charged. The authorization is released when pickup is completed or the pharmacy declines. IPNUS captures $5 only if the medication is not picked up after 48 hours.</p> : null}{reservation?.pointsRedeemed ? <p className="mt-6 rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-900">{reservation.pointsRedeemed} IP Points reserved for ${(reservation.rewardDiscountCents / 100).toFixed(2)} off. They will be returned if the pharmacy cannot fulfill the reservation.</p> : null}{reservation?.pharmacy ? <p className="mt-6 text-sm text-slate-600">Request sent to <strong>{reservation.pharmacy.name}</strong>.</p> : null}<div className="mt-8 flex flex-wrap gap-3"><Link href="/search" className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Make another search</Link><Link href="/rewards" className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">View IP Rewards</Link></div></div></div></PublicPage>;
}
