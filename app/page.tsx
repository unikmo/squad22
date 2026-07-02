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
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                  Find the <span className="text-emerald-600">lowest cash price</span>
                  for your prescription
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-3 max-w-xl">
                  Compare <span className="text-emerald-600 font-semibold">real prescription prices</span> from <span className="text-emerald-600 font-semibold">independent pharmacies</span> near you.
                </p>
                <div className="mt-4 text-sm text-gray-700">
                  <span className="text-emerald-600 font-semibold">Real prices</span> • No hidden fees • <span className="text-emerald-600 font-semibold">Independent pharmacies</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <SearchFormClient drugs={drugs} showLocationButton={false} />
          </div>
        </div>
      </div>
    </div>
  );
}


