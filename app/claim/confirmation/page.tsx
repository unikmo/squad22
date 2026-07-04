import { IPNNav } from "../../lib/ipn-nav";
import Link from "next/link";

function readQuery(searchParams: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") sp.set(k, v);
  }
  return sp;
}

import { db } from "../../lib/ipn-db";

export default async function ClaimConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = readQuery(await searchParams);
  const claimId = sp.get("claimId") ?? "";
  const npi = sp.get("npi") ?? "";

  const claim = claimId
    ? await db.pharmacyClaim.findUnique({ where: { id: claimId } })
    : null;

  const status = claim?.status ?? "unclaimed";

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-emerald-700 font-semibold">Claim request submitted</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">
            Your claim request has been submitted.
          </h1>
          <p className="text-gray-600 mt-3">
            We will verify your pharmacy details before activating the profile.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Claim ID</div>
              <div className="font-mono text-sm text-gray-900 mt-1">{claimId || "—"}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-semibold text-gray-900 mt-1">{status}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={npi ? `/pharmacy/${encodeURIComponent(npi)}` : "/search"}
              className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-900 px-6 py-3 rounded-xl font-semibold transition"
            >
              View profile
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Search prices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



