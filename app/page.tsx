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
            <div className="flex items-start gap-3">
              <div className="text-2xl pt-1" aria-hidden>
                🏷️
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
                  Find the lowest cash price for your prescription
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Compare real prices from independent pharmacies near you. No coupons. No memberships.
                </p>
                <div className="mt-4 text-sm text-gray-700">
                  No coupons · No memberships · Independent pharmacies
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <SearchFormClient drugs={drugs} showLocationButton={false} />
          </div>
        </div>
      </div>
    </div>
  );
}


