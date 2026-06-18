import { IPNNav } from "../lib/ipn-nav";
import type { SearchParams } from "../lib/ipn-types";
import { getPharmacyProfile } from "../lib/ipn-pharmacy-profile";
import Link from "next/link";
import { db } from "../lib/ipn-db";

function getParam(params: URLSearchParams, key: keyof SearchParams): string | undefined {
  return params.get(String(key)) ?? undefined;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") sp.set(k, v);
  }

  const drug = getParam(sp, "drug");
  const strength = sp.get("strength") ?? undefined;
  const quantityRaw = sp.get("quantity");
  const zip = sp.get("zip");

  const quantity = quantityRaw ? Math.max(1, Number(quantityRaw)) : 30;
  const safeDrug = (drug ?? "").trim();
  const safeZip = (zip ?? "").trim();

  const pharmacies = await db.pharmacy.findMany({ orderBy: { npi: "asc" } });

  // Avoid PrismaClient typing mismatches by using $queryRaw directly.
  // DrugPrice is the single source of truth for consumer pricing.
  const rows = await db.$queryRaw<Array<{
    pharmacyNpi: string;
    cashPriceCents: number;
  }>>`
    SELECT pharmacyNpi, cashPriceCents
    FROM DrugPrice
    WHERE status = 'active'
      AND drugName = ${safeDrug || ''}
      AND strength = ${strength ? String(strength) : ''}
      AND quantity = ${quantity}
  `;

  const bestPriceByPharmacy = new Map<string, number>();
  for (const row of rows) {
    // If multiple matches exist, keep the lowest cash price.
    const prev = bestPriceByPharmacy.get(row.pharmacyNpi);
    if (prev == null || row.cashPriceCents < prev) bestPriceByPharmacy.set(row.pharmacyNpi, row.cashPriceCents);
  }

  const results = pharmacies.map((ph) => {
    const cashPriceCents = bestPriceByPharmacy.get(ph.npi);
    const hasPublished = cashPriceCents != null;
    return {
      pharmacyNpi: ph.npi,
      pharmacyId: `ph-${ph.npi}`,
      hasPublished,
      reservePrice: cashPriceCents == null ? null : cashPriceCents / 100,
      drug: safeDrug,
      strength: strength ? String(strength) : undefined,
      quantity,
      zip: safeZip,
    };
  });

  results.sort((a, b) => {
    if (a.reservePrice == null && b.reservePrice == null) return 0;
    if (a.reservePrice == null) return 1;
    if (b.reservePrice == null) return -1;
    return a.reservePrice - b.reservePrice;
  });

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Cash prices</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
            {safeDrug ? safeDrug : "Search"}
            {strength ? <span className="text-gray-700"> • {strength}</span> : null}
          </h1>
          <p className="text-gray-600 mt-2">
            Quantity: <span className="font-medium text-gray-900">{quantity}</span> • ZIP: {safeZip || "—"}
            <span className="block text-xs text-gray-500 mt-2">
              Showing only published DrugPrice cash prices.
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {results.map((r) => {
            const prof = getPharmacyProfile(r.pharmacyId);

            return (
              <div key={r.pharmacyNpi} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold text-gray-900">
                        <Link href={`/pharmacy/${encodeURIComponent(r.pharmacyId)}`}>{r.pharmacyNpi}</Link>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                        Independent Pharmacy
                      </span>

                      {prof.tier === "claimed" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                          ✓ Claimed Profile
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold border border-gray-200">
                          Profile not yet claimed
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      {prof.tier === "claimed" ? (
                        r.hasPublished && r.reservePrice != null ? (
                          <>
                            <div className="text-sm text-gray-600">
                              Cash price:{" "}
                              <span className="font-semibold text-gray-900">USD {r.reservePrice.toFixed(2)}</span>
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
                        ) : (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-amber-800">Price not published yet.</span>
                          </div>
                        )
                      ) : (
                        <div className="text-sm text-gray-600">Profile not yet claimed.</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    {prof.tier === "claimed" && r.hasPublished && r.reservePrice != null ? (
                      <>
                        <div className="text-sm text-gray-600">
                            <span className="text-gray-500">Pharmacy: </span>
                            <span className="font-medium text-gray-900">{r.pharmacyNpi}</span>
                            <div className="text-xs text-gray-500">Pickup/delivery availability: confirmed after reserve.</div>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="text-xs text-gray-500">Cash price</span>
                            <div className="text-2xl font-bold text-gray-900 leading-tight">USD {r.reservePrice.toFixed(2)}</div>
                          </div>
                          <a
                            href={
                              `/reserve?pharmacyId=${encodeURIComponent(r.pharmacyId)}` +
                              `&drug=${encodeURIComponent(r.drug)}` +
                              `&strength=${encodeURIComponent(r.strength ?? "")}` +
                              `&quantity=${encodeURIComponent(String(r.quantity))}` +
                              `&zip=${encodeURIComponent(r.zip)}`
                            }
                            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold text-base transition"
                          >
                            Reserve this price
                          </a>
                          <div className="text-xs text-gray-500">
                            Pickup/Delivery: we’ll confirm availability after you reserve.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="inline-flex items-center justify-center bg-white border border-amber-200 text-amber-800 px-6 py-3 rounded-xl font-semibold transition">
                            Call pharmacy
                          </div>
                          <div className="text-xs text-gray-500">Price may not be published for this match.</div>
                        </>
                      )}
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



