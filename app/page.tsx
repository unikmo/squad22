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
            <h1 className="text-6xl font-bold tracking-tighter text-gray-900 leading-tight mb-6">
              Find affordable prescription prices<br />
              at <span className="text-emerald-600">independent pharmacies</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Real Prices. No Coupons. No Fees. Support local pharmacies.
              <br />
              Search cash prices and reserve with confidence.
            </p>

            <div className="mt-10">
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


