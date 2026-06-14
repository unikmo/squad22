import { IPNNav } from "../lib/ipn-nav";
import Link from "next/link";

export default function ClaimLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-emerald-700 font-semibold">Claim Your Pharmacy</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">Start a claim request</h1>
          <p className="text-gray-600 mt-3">
            Pick an NPI (MVP) to preview the claim workflow.
          </p>

          <div className="mt-6 space-y-3">
            <Link href="/claim/1111111112" className="block text-emerald-700 hover:underline">
              Claim NPI 1111111112
            </Link>
            <Link href="/claim/4444444441" className="block text-emerald-700 hover:underline">
              Claim NPI 4444444441
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

