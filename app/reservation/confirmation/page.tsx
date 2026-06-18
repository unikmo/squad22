import { IPNNav } from "../../lib/ipn-nav";
import Link from "next/link";
import { db } from "../../lib/ipn-db";

function readQuery(searchParams: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") sp.set(k, v);
  }
  return sp;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = readQuery(searchParams);
  const reservationId = sp.get("reservationId") ?? "";
  const reservationNumber = sp.get("reservationNumber") ?? "";
  const npi = sp.get("npi") ?? "";

  const reservation = reservationId
    ? await db.reservation.findUnique({ where: { id: reservationId } })
    : null;

  const savedReservationNumber = reservation?.reservationNumber ?? reservationNumber;
  const status = reservation?.status ?? "pending";
  const feeCents = reservation?.reservationFeeCents ?? 500;
  const feeStatus = reservation?.reservationFeeStatus ?? "waived";
  const feeDollars = Math.round(feeCents) / 100;

  const estimatedPoints = reservation?.rewardPointsEstimated ?? null;
  const hasEstimatedPoints = typeof estimatedPoints === "number" && Number.isFinite(estimatedPoints);

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-emerald-700 font-semibold">Reservation submitted</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
            We’ll contact you to confirm pickup.
          </h1>


          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Reservation #</div>
              <div className="font-mono text-sm text-gray-900 mt-1">{savedReservationNumber || "—"}</div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-semibold text-gray-900 mt-1">{status}</div>
              <div className="text-sm text-gray-600 mt-1">Pending pharmacy confirmation.</div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
              <div className="text-sm text-gray-500">Reservation fee</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                ${feeDollars.toFixed(2)} refundable deposit
              </div>
              <div className="text-sm text-gray-600 mt-1">
                This fee is not currently charged. The platform reserves the right to activate this policy in the future.
              </div>
              <div className="mt-3 text-sm text-gray-700">
Prescription verification:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Refunded if the pharmacy cannot fulfill the reservation.</li>
                  <li>Refunded after successful pickup.</li>
                  <li>Refunded if cancelled before the pharmacy begins processing.</li>
                  <li>Forfeited for no-shows.</li>
                </ul>
              </div>
              <div className="text-xs text-gray-500 mt-3">Reservation fee status: {feeStatus}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-900 px-6 py-3 rounded-xl font-semibold transition"
            >
              Make another search
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              View more pharmacies
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            {hasEstimatedPoints ? (
              <>
                Earn <span className="font-medium text-gray-900">{estimatedPoints} pending IPNUS points</span> after the pharmacy completes the reservation.
              </>
            ) : (
              <>Earn pending IPNUS points after the pharmacy completes the reservation.</>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Prescription policy: Prescription drugs require a valid prescription before reservation confirmation. OTC products do not require prescriptions.
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Reservation is persisted and appears in /admin and the pharmacy dashboard.
          </div>

          <div className="mt-4">
            {npi ? (
              <Link
                href={`/pharmacy-dashboard/${encodeURIComponent(npi)}`}
                className="text-sm text-emerald-700 hover:text-emerald-800 underline"
              >
                Go to pharmacy dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

