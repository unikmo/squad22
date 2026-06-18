'use client';

import Link from 'next/link';
import { getTopDrugSuggestions } from './lib/ipn-mock-data';
import { SearchFormClient } from './search/search-form-client';

export default function Home() {
  const drugs = getTopDrugSuggestions();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-emerald-600">IPNUS</div>
            <span className="text-gray-500 font-medium">Independent Pharmacy Network</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <Link href="/search" className="hover:text-emerald-600">Search Prices</Link>
            <Link href="/claim" className="hover:text-emerald-600">Claim Your Pharmacy</Link>
            <Link href="/pricing" className="hover:text-emerald-600">For Pharmacies</Link>
            <Link href="/login" className="text-emerald-600 font-semibold">Sign in</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-5">
              Find real cash prices at independent pharmacies
            </h1>
            <p className="text-lg text-gray-600 mb-7 max-w-lg">
              Search medication prices by ZIP code and reserve with confidence.
            </p>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                  <span aria-hidden>🏥</span> Real pharmacy prices
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                  <span aria-hidden>✅</span> No coupons
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                  <span aria-hidden>💳</span> No hidden fees
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold border border-emerald-100">
                  <span aria-hidden>🤝</span> Support local pharmacies
                </div>
              </div>

              <div className="relative rounded-2xl border border-emerald-100 bg-emerald-50 p-4 mb-6">
                <div className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                  <span aria-hidden>💊</span> Search • Compare • Reserve
                </div>
                <div className="text-sm text-emerald-800 mt-1">Enter a ZIP code to see cash prices from participating independent pharmacies.</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
              <ol className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">1</span>
                  <div>
                    <div className="font-medium text-gray-900">Search your medication</div>
                    <div className="text-sm text-gray-600">Choose a drug (and optional strength/quantity).</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">2</span>
                  <div>
                    <div className="font-medium text-gray-900">Compare local pharmacy prices</div>
                    <div className="text-sm text-gray-600">See cash price options from nearby independent pharmacies.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">3</span>
                  <div>
                    <div className="font-medium text-gray-900">Reserve at your chosen pharmacy</div>
                    <div className="text-sm text-gray-600">Reserve and we’ll help coordinate confirmation.</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <SearchFormClient drugs={drugs} />
          </div>
        </div>
      </div>
    </div>
  );
}


