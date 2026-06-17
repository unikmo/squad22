import { IPNNav } from "../../../app/lib/ipn-nav";
import { db } from "../../../app/lib/ipn-db";
import Link from "next/link";

function fmtMoneyFromCents(cents: unknown) {
  const n = typeof cents === "number" && Number.isFinite(cents) ? cents : null;
  if (n === null) return "—";
  const dollars = n / 100;
  return `$${dollars.toFixed(2)}`;
}

function safeJsonObj(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function toStringOrDash(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" && v.trim() !== "") return v;
  return "—";
}

function toNumberOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export default async function PharmacyDashboardPage({
  params,
}: {
  params: { npi: string };
}) {
  const npi = params.npi;

  const pharmacy = await db.pharmacy.findUnique({ where: { npi } });
  const claims = await db.pharmacyClaim.findMany({
    where: { pharmacyNpi: npi },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const reservations = await db.reservation.findMany({
    where: { pharmacyNpi: npi },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      // priceResult / reservationInput are stored as Json; Prisma returns them as unknown.
    },
  });

  const maxMilesRule = 20;
  const deliveryRadiusMiles = pharmacy?.deliveryRadiusMiles ?? null;
  const deliveryRadiusDisplay = deliveryRadiusMiles == null ? null : Math.max(0, deliveryRadiusMiles);
  const deliveryRadiusFlag =
    deliveryRadiusMiles != null && deliveryRadiusMiles > maxMilesRule ? ` (max ${maxMilesRule} miles)` : "";

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                IPNUS pharmacy dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Pharmacy: <span className="font-semibold">{pharmacy?.name ?? "—"}</span> • NPI:{" "}
                <span className="font-mono">{npi}</span>
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/pharmacy/${encodeURIComponent(npi)}`}
                className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-900 px-4 py-2 rounded-xl font-semibold transition"
              >
                View public profile
              </Link>
            </div>
          </div>
        </div>

        {/* Operational summary */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">Operational status</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">Profile status</div>
              <div className="font-semibold text-gray-900 mt-1">{toStringOrDash(pharmacy?.profileStatus)}</div>
              <div className="mt-3 text-sm text-gray-500">Pricing status</div>
              <div className="font-semibold text-gray-900 mt-1">
                {pharmacy?.pricingPublished ? "✓ Cash prices published" : "— Cash prices not published"}
              </div>
              <div className="mt-3 text-sm text-gray-500">Reservation status</div>
              <div className="font-semibold text-gray-900 mt-1">
                {pharmacy?.reservationsEnabled ? "✓ Reservations enabled" : "— Reservations disabled"}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">Founding partner</div>
              <div className="font-semibold text-gray-900 mt-1">
                {pharmacy?.foundingPartner ? "✓ Yes" : "—"}
                {pharmacy?.foundingPartner ? ` • Free trial: ${pharmacy.freeTrialMonths} months` : ""}
              </div>
              <div className="mt-3 text-sm text-gray-500">Delivery settings summary</div>
              <div className="font-semibold text-gray-900 mt-1">
                {pharmacy?.deliveryEnabled ? "✓ Local delivery enabled" : "— Local delivery disabled"}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Radius:{" "}
                {pharmacy?.deliveryEnabled ? (
                  <>
                    {deliveryRadiusDisplay == null ? "—" : `${Math.min(deliveryRadiusDisplay, maxMilesRule)} miles${deliveryRadiusFlag}`}
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-sm text-gray-700">
                Delivery fee:{" "}
                {pharmacy?.deliveryEnabled ? fmtMoneyFromCents(pharmacy?.deliveryFeeCents) : "—"}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Max 20 miles rule is enforced for local delivery.
              </div>
            </div>
          </div>

          {pharmacy?.foundingPartner ? (
            <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="font-semibold text-emerald-900">Founding partner terms</div>
              <div className="text-emerald-900/80 text-sm mt-1">
                Founding partner terms are manually assigned during onboarding.
              </div>
            </div>
          ) : null}
        </section>

        {/* Claims (kept as-is) */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">Claims</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Claim ID</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-left p-3 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c: { id: string; status: string; createdAt: Date }) => (
                  <tr key={c.id}>
                    <td className="p-3 border-b font-mono">{c.id}</td>
                    <td className="p-3 border-b">{c.status}</td>
                    <td className="p-3 border-b">{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}

                {claims.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      No claims.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Price management */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">Price management</h2>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <div className="font-semibold text-gray-900">CSV upload (default bulk pricing)</div>
              <div className="text-sm text-gray-600 mt-1">
                Upload a CSV to set bulk cash prices for your pharmacy. (This does not introduce a second pricing engine.)
              </div>

              <form
                className="mt-4 space-y-3"
                method="post"
                action="/api/pharmacy-prices/import"
                encType="multipart/form-data"
              >
                <input type="hidden" name="pharmacyNpi" value={npi} />

                <label className="block">
                  <span className="text-sm font-medium text-gray-900">CSV file</span>
                  <input
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Upload CSV
                </button>
              </form>
            </div>

            <div className="rounded-xl border p-4">
              <div className="font-semibold text-gray-900">Manual repricing (pricing wizard / individual drugs)</div>
              <div className="text-sm text-gray-600 mt-1">
                Use this to repricing individual drugs. Pricing wizard/manual edit = repricing individual drugs.
              </div>

              <form className="mt-4 space-y-3" method="post" action="/api/pharmacy-prices">
                <input type="hidden" name="pharmacyNpi" value={npi} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900">Drug name</span>
                    <input
                      name="drugName"
                      className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900">Strength</span>
                    <input
                      name="strength"
                      className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900">Quantity</span>
                    <input
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900">Cash price (USD)</span>
                    <input
                      name="cashPrice"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      min={0}
                      className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Save drug price
                </button>

                <div className="text-xs text-gray-500">
                  CSV upload = default bulk pricing • Manual repricing = repricing individual drugs
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Reservation management + Prescription review queue */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Reservations</h2>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Reservation #</th>
                  <th className="text-left p-3 border-b">Prescription status</th>
                  <th className="text-left p-3 border-b">Drug</th>
                  <th className="text-left p-3 border-b">Fulfillment</th>
                  <th className="text-left p-3 border-b">Prices</th>
                  <th className="text-left p-3 border-b">Rewards</th>
                  <th className="text-left p-3 border-b">Update</th>
                </tr>
              </thead>
              <tbody>
{reservations.map((r) => {
                  const priceResult = safeJsonObj(
                    (r as unknown as { priceResult?: unknown }).priceResult,
                  );
                  const reservationInput = safeJsonObj(
                    (r as unknown as { reservationInput?: unknown }).reservationInput,
                  );

                  const drug = toStringOrDash(priceResult.drug);

                  const strength = toStringOrDash(priceResult.strength);
                  const quantity = toNumberOrNull(priceResult.quantity);

const cashPriceCents = toNumberOrNull((priceResult as { cashPriceCents?: unknown }).cashPriceCents);
                  const reservePrice = toNumberOrNull(priceResult.reservePrice);
                  const reservePriceCents =
                    reservePrice != null && reservePrice >= 0 ? Math.round(reservePrice * 100) : null;

                  const fulfillmentMethod = toStringOrDash(r.fulfillmentMethod ?? priceResult.fulfillmentMethod);
                  const prescriptionStatus = toStringOrDash(r.prescriptionStatus);

                  const deliveryAddress = safeJsonObj(r.deliveryAddress);
                  const deliveryLine = toStringOrDash(deliveryAddress.line);
                  const deliveryCity = toStringOrDash(deliveryAddress.city);
                  const deliveryState = toStringOrDash(deliveryAddress.state);
                  const deliveryZip = toStringOrDash(deliveryAddress.zip);

                  const rewardPointsEstimated = toNumberOrNull(r.rewardPointsEstimated);

                  // Doctor referral ID/referralCode may live inside reservationInput; best-effort.
                  const referralCode =
                    toStringOrDash(reservationInput.referralCode ?? reservationInput.referralCodePicker);
                  const doctorReferralId =
                    toStringOrDash(reservationInput.doctorReferralId ?? reservationInput.doctorName);

                  const referralDisplay =
                    referralCode !== "—"
                      ? `Ref: ${referralCode}`
                      : doctorReferralId !== "—"
                        ? `Doctor: ${doctorReferralId}`
                        : "—";

                  const pricesDisplay =
                    fulfillmentMethod === "local_delivery"
                      ? `${fmtMoneyFromCents(cashPriceCents)} / ${reservePriceCents == null ? "—" : fmtMoneyFromCents(reservePriceCents)}`
                      : `${fmtMoneyFromCents(cashPriceCents)} / ${reservePriceCents == null ? "—" : fmtMoneyFromCents(reservePriceCents)}`;

                  const showDelivery = fulfillmentMethod === "local_delivery";

                  return (
                    <tr key={r.id}>
                      <td className="p-3 border-b font-mono align-top">{r.reservationNumber}</td>
                      <td className="p-3 border-b align-top">
                        <div className="font-semibold">{prescriptionStatus}</div>
                        <div className="text-xs text-gray-500 mt-1">Status: {r.status}</div>
                      </td>
                      <td className="p-3 border-b align-top">
                        <div className="font-semibold text-gray-900">{drug}</div>
                        <div className="text-sm text-gray-700">
                          {strength !== "—" ? `Strength: ${strength}` : "—"}
                        </div>
                        <div className="text-sm text-gray-700">Qty: {quantity == null ? "—" : quantity}</div>
                      </td>
                      <td className="p-3 border-b align-top">
                        <div className="font-semibold">{toStringOrDash(r.fulfillmentMethod)}</div>
                        {showDelivery ? (
                          <div className="text-xs text-gray-600 mt-1">
                            {deliveryLine}
                            {deliveryLine !== "—" ? <br /> : null}
                            {deliveryCity !== "—" && deliveryState !== "—" ? `${deliveryCity}, ${deliveryState} ${deliveryZip}` : "—"}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 mt-1">Pickup</div>
                        )}
                      </td>
                      <td className="p-3 border-b align-top">
                        <div className="text-sm text-gray-900 font-semibold">{pricesDisplay}</div>
                        <div className="text-xs text-gray-500 mt-1">cashPriceCents / reservePrice</div>
                      </td>
                      <td className="p-3 border-b align-top">
                        <div className="font-semibold">{rewardPointsEstimated == null ? "—" : `${rewardPointsEstimated} pts`}</div>
                        <div className="text-xs text-gray-500 mt-1">{referralDisplay}</div>
                      </td>
                      <td className="p-3 border-b align-top">
                        <div className="flex flex-wrap gap-2">
                          {/* Keep existing reservation status action buttons unchanged */}
                          <form action="/api/pharmacy-reservation-actions" method="post">
                            <input type="hidden" name="reservationId" value={r.id} />
                            <input type="hidden" name="action" value="PHARMACY_CONFIRMED" />
                            <button type="submit" className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                              Confirm
                            </button>
                          </form>

                          <form action="/api/pharmacy-reservation-actions" method="post">
                            <input type="hidden" name="reservationId" value={r.id} />
                            <input type="hidden" name="action" value="READY_FOR_PICKUP" />
                            <button type="submit" className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                              Ready
                            </button>
                          </form>

                          <form action="/api/pharmacy-reservation-actions" method="post">
                            <input type="hidden" name="reservationId" value={r.id} />
                            <input type="hidden" name="action" value="COMPLETED" />
                            <button type="submit" className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold">
                              Complete
                            </button>
                          </form>

                          <form action="/api/pharmacy-reservation-actions" method="post">
                            <input type="hidden" name="reservationId" value={r.id} />
                            <input type="hidden" name="action" value="DECLINED_BY_PHARMACY" />
                            <button type="submit" className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
                              Decline
                            </button>
                          </form>

                          <form action="/api/pharmacy-reservation-actions" method="post">
                            <input type="hidden" name="reservationId" value={r.id} />
                            <input type="hidden" name="action" value="NO_SHOW" />
                            <button type="submit" className="px-2 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold">
                              No-show
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {reservations.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={7}>
                      No reservations.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Prescription review queue */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">Prescription review queue</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border-b">Reservation #</th>
                    <th className="text-left p-3 border-b">Prescription status</th>
                    <th className="text-left p-3 border-b">Uploaded/acknowledged</th>
                  </tr>
                </thead>
                <tbody>
{reservations.filter((r) => (r as { prescriptionStatus?: unknown }).prescriptionStatus === "required_pending_verification").length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={3}>
                        No prescriptions require review at this time.
                      </td>
                    </tr>
                  ) : null}

                  {reservations
                    .filter((r) => (r as { prescriptionStatus?: unknown }).prescriptionStatus === "required_pending_verification")
                    .map((r) => {
                      const reservationInput = safeJsonObj(r.reservationInput);

                      const rxUploadAcknowledged =
                        reservationInput.rxUploadAcknowledged === true || reservationInput.rxUploadAcknowledged === "true";
                      const rxUploadPresent = reservationInput.rxUpload ? true : false;

                      return (
                        <tr key={r.id}>
                          <td className="p-3 border-b font-mono align-top">{r.reservationNumber}</td>
                          <td className="p-3 border-b align-top">
                            <div className="font-semibold">{toStringOrDash(r.prescriptionStatus)}</div>
                            <div className="text-xs text-gray-500 mt-1">Action prompt below</div>
                          </td>
                          <td className="p-3 border-b align-top">
                            <div className="text-sm text-gray-900 font-semibold">
                              {rxUploadPresent ? "✓ Uploaded" : "— Uploaded"}
                              {" • "}
                              {rxUploadAcknowledged ? "✓ Acknowledged" : "— Not acknowledged"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-semibold text-amber-900">Prescription uploadAction</div>
              <div className="text-sm text-amber-900/80 mt-1">
Prescription uploadAction: Review code for readability, quality, and issues (see below for action prompt) storage pending.

              </div>
              <div className="text-xs text-amber-900/70 mt-2">
                Storage and file uploadAction review UI are pending until file storage is supported.
              </div>
            </div>
          </div>
        </section>

        {/* Local delivery settings (read-only) */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Local delivery settings</h2>
          <div className="mt-3 rounded-xl border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">deliveryEnabled</div>
                <div className="font-semibold text-gray-900 mt-1">{pharmacy?.deliveryEnabled ? "true" : "false"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">deliveryRadiusMiles</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {deliveryRadiusDisplay == null ? "—" : `${Math.min(deliveryRadiusDisplay, maxMilesRule)} miles`}
                  {deliveryRadiusFlag}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">deliveryFeeCents</div>
                <div className="font-semibold text-gray-900 mt-1">{pharmacy?.deliveryFeeCents == null ? "—" : fmtMoneyFromCents(pharmacy.deliveryFeeCents)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Edit API</div>
                <div className="font-semibold text-gray-900 mt-1">P1 gap</div>
                <div className="text-xs text-gray-500 mt-1">Read-only for MVP; edit API not yet available.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}





