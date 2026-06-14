import { IPNNav } from "../lib/ipn-nav";
import { PHARMACIES, computePriceResult } from "../lib/ipn-mock-data";
import Link from "next/link";

function readQuery(searchParams: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") sp.set(k, v);
  }
  return sp;
}

export default function ReservePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = readQuery(searchParams);

  const pharmacyId = sp.get("pharmacyId") ?? "";
  const drug = sp.get("drug") ?? "";
  const strength = sp.get("strength") ?? undefined;
  const quantity = Math.max(1, Number(sp.get("quantity") ?? 30));
  const zip = sp.get("zip") ?? "";

  const pharmacy = PHARMACIES.find((p) => p.id === pharmacyId) ?? PHARMACIES[0];

  const priceResult = computePriceResult({
    drug,
    strength: strength || undefined,
    quantity,
    zip: zip || pharmacy.zip,
    pharmacy,
  });

  // In this MVP, we POST the reservation request to the DB-backed route.
  const action = "/api/reservation-submissions";

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Reservation</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
            Reserve at <span className="text-emerald-700">{priceResult.priceRange.currency} {priceResult.reservePrice}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {pharmacy.name} • {pharmacy.city}, {pharmacy.state}
          </p>
        </div>

        <form method="post" action={action} className="rounded-2xl border bg-white p-6 shadow-sm">
          <input type="hidden" name="npi" value={pharmacy.id.replace(/^ph-/, "")} />
          <input type="hidden" name="pharmacyNpi" value={pharmacy.id.replace(/^ph-/, "")} />


          <input type="hidden" name="drug" value={priceResult.drug} />
          <input type="hidden" name="strength" value={priceResult.strength ?? ""} />
          <input type="hidden" name="quantity" value={String(priceResult.quantity)} />
          <input type="hidden" name="zip" value={priceResult.zip} />

          <input type="hidden" name="reservePrice" value={String(priceResult.reservePrice)} />
          <input type="hidden" name="priceLow" value={String(priceResult.priceRange.low)} />
          <input type="hidden" name="priceHigh" value={String(priceResult.priceRange.high)} />

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">First name</label>
                <input
                  name="firstName"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Last name</label>
                <input
                  name="lastName"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Phone number</label>
              <input
                name="phone"
                type="tel"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="text-sm text-gray-600">
              <div className="font-semibold text-gray-900">Prescription upload (optional)</div>
              <div className="mt-1">We store the reservation request (file storage omitted in MVP).</div>
              <input
                name="rxUpload"
                type="file"
                accept="image/*,application/pdf"
                className="mt-3 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Notes to pharmacy (optional)</label>
              <textarea
                name="notes"
                rows={3}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Submit Reservation Request
            </button>

            <div className="text-xs text-gray-500">
              By submitting, you agree we can contact you to confirm availability.
            </div>

            <div>
              <Link href="/results" className="text-sm text-emerald-700 hover:text-emerald-800 underline">
                Back to results
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

