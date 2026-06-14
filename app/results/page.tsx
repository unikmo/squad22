import { PHARMACIES, computePriceResult, getTopDrugSuggestions } from "../lib/ipn-mock-data";
import { IPNNav } from "../lib/ipn-nav";
import type { SearchParams } from "../lib/ipn-types";
import { getPharmacyProfile } from "../lib/ipn-pharmacy-profile";
import Link from "next/link";




function getParam(params: URLSearchParams, key: keyof SearchParams): string | undefined {
  return params.get(String(key)) ?? undefined;
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") sp.set(k, v);
  }

  const drug = getParam(sp, "drug");
  const strength = sp.get("strength") ?? undefined;
  const quantityRaw = sp.get("quantity");
  const zip = sp.get("zip");

  const quantity = quantityRaw ? Math.max(1, Number(quantityRaw)) : 30;

  const safeDrug = (drug ?? "").trim();
  const safeZip = (zip ?? "").trim();

  const topDrugs = getTopDrugSuggestions().map((d) => d.name);
  const drugIsKnown = safeDrug.length > 0 && topDrugs.some((n) => n.toLowerCase() === safeDrug.toLowerCase());

  const results = PHARMACIES.map((ph) => {
    return computePriceResult({
      drug: safeDrug || "Unknown drug",
      strength: strength ? String(strength) : undefined,
      quantity,
      zip: safeZip || "00000",
      pharmacy: ph,
    });
  }).sort((a, b) => a.reservePrice - b.reservePrice);

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Cash price estimates</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
            {safeDrug ? safeDrug : "Search"}
            {strength ? <span className="text-gray-700"> • {strength}</span> : null}
          </h1>
          <p className="text-gray-600 mt-2">
            Quantity: <span className="font-medium text-gray-900">{quantity}</span> • ZIP: {safeZip || "—"}
            {!drugIsKnown && safeDrug ? (
              <span className="block text-xs text-amber-700 mt-2">
                Drug not found in the MVP list. Showing estimated ranges anyway.
              </span>
            ) : null}
          </p>
        </div>

        <div className="space-y-4">
          {results.map((r) => {
            const ph = PHARMACIES.find((x) => x.id === r.pharmacyId)!;
            return (
              <div
                key={r.pharmacyId}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold text-gray-900">
                        <Link href={`/pharmacy/${encodeURIComponent(ph.id)}`}>{ph.name}</Link>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                        Independent Pharmacy
                      </span>
                      {(() => {
                        const prof = getPharmacyProfile(ph.id);
                        if (prof.tier === "claimed") {
                          return (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                              ✓ Claimed Profile
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold border border-gray-200">
                            Profile not yet claimed
                          </span>
                        );
                      })()}

                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      {(() => {
                        const prof = getPharmacyProfile(ph.id);
                        if (prof.tier === "claimed") {
                          return (
                            <>
                              <div className="text-sm text-gray-600">
                                Cash price estimate:{" "}
                                <span className="font-semibold text-gray-900">
                                  {r.priceRange.currency} {r.reservePrice}
                                </span>
                                <span className="text-gray-500"> (range {r.priceRange.low}-{r.priceRange.high})</span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                                  ✓ Cash Prices Available
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                                  ✓ Prescription Reservations
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                                  ✓ Responds within {prof.respondsWithinHours ?? 2} hours
                                </span>
                              </div>
                            </>
                          );
                        }

                        return (
                          <>
                            <div className="text-sm text-gray-600">
                              {ph.city}, {ph.state} • {ph.distanceMiles.toFixed(1)} miles
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold text-amber-800">Price not verified yet.</span> Call this pharmacy or request they join.
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold border border-amber-100">
                                Unclaimed profile
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>


                  <div className="flex flex-col sm:items-end gap-2">
                    {(() => {
                      const prof = getPharmacyProfile(r.pharmacyId);
                      if (prof.tier === "claimed") {
                        return (
                          <>
                            <a
                              href={
                                `/reserve?pharmacyId=${encodeURIComponent(r.pharmacyId)}` +
                                `&drug=${encodeURIComponent(r.drug)}` +
                                `&strength=${encodeURIComponent(r.strength ?? "")}` +
                                `&quantity=${encodeURIComponent(String(r.quantity))}` +
                                `&zip=${encodeURIComponent(r.zip)}`
                              }
                              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                            >
                              Reserve at This Price
                            </a>
                            <div className="text-xs text-gray-500">No login. We’ll contact you to confirm.</div>
                          </>
                        );
                      }
                      return (
                        <>
                          <div className="inline-flex items-center justify-center bg-white border border-amber-200 text-amber-800 px-6 py-3 rounded-xl font-semibold transition">
                            Call pharmacy
                          </div>
                          <div className="text-xs text-gray-500">Profile not yet claimed.</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

