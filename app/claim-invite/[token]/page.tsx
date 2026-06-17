import { IPNNav } from "../../../app/lib/ipn-nav";
import Link from "next/link";
import { db } from "../../../app/lib/ipn-db";
import { redirect } from "next/navigation";

function getTokenFromParams(params: { token: string }) {
  return params.token;
}

export default async function ClaimInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const token = getTokenFromParams(params);

  const claimInvite = await db.claimInvite.findUnique({
    where: { token },
    include: { pharmacy: true },
  });

  if (!claimInvite) {
    redirect("/claim");
  }

  if (claimInvite.status !== "active") {
    redirect("/claim");
  }

  if (claimInvite.expiresAt && new Date(claimInvite.expiresAt) <= new Date()) {
    redirect("/claim");
  }

  const pharmacy = claimInvite.pharmacy;

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Pharmacy claim invite</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
            Request Profile Claim
          </h1>
          <p className="text-gray-600 mt-2">
            You’re claiming: <span className="font-semibold">{pharmacy.name}</span>
          </p>

          <div className="text-sm text-gray-700 mt-3">
            {pharmacy.address1}
            {pharmacy.address2 ? `, ${pharmacy.address2}` : null}
            <br />
            {pharmacy.city}, {pharmacy.state} {pharmacy.zip}
          </div>
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
                defaultValue={pharmacy.name}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">NPI</label>
              <input
                name="npi"
                defaultValue={pharmacy.npi}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                readOnly
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
              You may not receive an email notification for this request.
            </div>

            <div className="flex gap-3 items-center">
              <Link
                href={`/pharmacy/${encodeURIComponent(pharmacy.npi)}`}
                className="text-sm text-emerald-700 hover:underline"
              >
                Back to profile
              </Link>
            </div>

            <input type="hidden" name="inviteToken" value={token} />
          </div>
        </form>
      </div>
    </div>
  );
}

