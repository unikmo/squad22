import { IPNNav } from "../../lib/ipn-nav";
import { PHARMACIES } from "../../lib/ipn-mock-data";
import { getPharmacyClaimProfile } from "../../lib/ipn-claims-store";
import Link from "next/link";
import type { PriorityState } from "../../lib/ipn-types";



// (MVP) directory is mocked; state list kept for future extension.
const STATES: PriorityState[] = ["TX", "FL", "OH", "PA", "NC", "NY"];
// Silence unused-var warning in MVP.
void STATES;




function formatBadge(active: boolean, claimed: boolean) {
  if (claimed) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
        ✓ Profile claimed
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
        ✓ Independent Pharmacy
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold border border-gray-200">
      Independent Pharmacy
    </span>
  );
}

export default function PharmacyProfilePage({ params }: { params: { npi: string } }) {
  const npi = params.npi;

  const mockPharmacy =
    PHARMACIES.find((p) => p.id === `ph-${npi}`) ?? PHARMACIES.find((p) => p.id === npi);


  const claim = getPharmacyClaimProfile(npi);

  // Prefer claim-store location/address when available, otherwise mock directory.
  const state = (mockPharmacy?.state ?? claim.state) as PriorityState;
  const city = mockPharmacy?.city ?? claim.city;
  const zip = mockPharmacy?.zip ?? claim.zip;
  const address1 = mockPharmacy?.addressLine ?? claim.address1;
  const phone = mockPharmacy ? "(phone unavailable)" : claim.phone;

  const claimed = claim.profileStatus === "claimed";

  const badgeIndependent = true;

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Pharmacy Profile</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">{mockPharmacy?.name ?? claim.pharmacyName}</h1>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {formatBadge(badgeIndependent, claimed)}
            {claimed ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                ✓ Profile claimed
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold border border-gray-200">
                Profile not claimed
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-gray-900">Address</div>
              <div>
                {address1}
                {claim.address2 ? `, ${claim.address2}` : null}
              </div>
              <div>
                {city}, {state} {zip}
              </div>
            </div>

            <div className="text-sm text-gray-700">
              <div className="font-semibold text-gray-900">Phone</div>
              <div>{phone || "—"}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={
                claim.pricingPublished
                  ? "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100"
                  : "inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold border border-amber-100"
              }>
                {claim.pricingPublished ? "✓ Cash prices published" : "Cash prices not published"}
              </span>

              <span className={
                claim.reservationsEnabled
                  ? "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100"
                  : "inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold border border-amber-100"
              }>
                {claim.reservationsEnabled ? "✓ Reservations enabled" : "Reservations disabled"}
              </span>
            </div>

            {!claimed ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <div className="text-emerald-900 font-semibold">This profile has not yet been claimed.</div>
                <div className="text-emerald-900/80 mt-1 text-sm">
                  Claim it to publish cash prices and receive prescription reservations.
                </div>
                <Link
                  href={`/claim/${encodeURIComponent(npi)}`}
                  className="mt-4 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Claim This Pharmacy
                </Link>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="text-emerald-900 font-semibold">Profile claimed</div>
                <div className="text-gray-700/80 mt-2 text-sm">Available actions</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <Link href="#" className="inline-flex items-center justify-center border border-emerald-200 hover:border-emerald-300 text-emerald-800 px-5 py-3 rounded-xl font-semibold transition">
                    Upload prices
                  </Link>
                  <Link href="#" className="inline-flex items-center justify-center border border-emerald-200 hover:border-emerald-300 text-emerald-800 px-5 py-3 rounded-xl font-semibold transition">
                    Manage reservations
                  </Link>
                  <Link href="#" className="inline-flex items-center justify-center border border-emerald-200 hover:border-emerald-300 text-emerald-800 px-5 py-3 rounded-xl font-semibold transition">
                    Edit profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

