import { IPNNav } from "../../lib/ipn-nav";
import Link from "next/link";
import { PHARMACIES } from "../../lib/ipn-mock-data";

export default function ClaimFormPage({ params }: { params: { npi: string } }) {
  const npi = params.npi;

  const pharmacy = PHARMACIES.find((p) => p.id === npi) ?? PHARMACIES[0];

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Claim My Profile</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">Request Profile Claim</h1>
          <p className="text-gray-600 mt-2">Submit your information and we’ll verify your pharmacy details.</p>
        </div>

        <form
          method="post"
          action="/api/claim-submissions"
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Pharmacy name</label>
              <input
                name="pharmacyName"
                defaultValue={pharmacy?.name}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">NPI</label>
              <input
                name="npi"
                defaultValue={npi}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Contact name</label>
                <input
                  name="contactName"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Role / title</label>
                <input
                  name="roleTitle"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Phone</label>
              <input
                name="phone"
                type="tel"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Message (optional)</label>
              <textarea
                name="message"
                rows={4}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Request Profile Claim
            </button>

            <div className="text-xs text-gray-500">
              No email is sent in this MVP—your submission will simply route to confirmation.
            </div>

            <div>
              <Link href={`/pharmacy/${encodeURIComponent(npi)}`} className="text-sm text-emerald-700 hover:underline">
                Back to profile
              </Link>
            </div>

            <input type="hidden" name="npi" value={npi} />
            <input type="hidden" name="pharmacyName" value={pharmacy?.name ?? ""} />

            <div>
              <span className="text-xs text-gray-500">Submit will create a claim record.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

