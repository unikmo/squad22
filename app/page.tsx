'use client';

import Link from 'next/link';

export default function Home() {
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
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter text-gray-900 leading-tight mb-6">
              Find affordable prescription prices<br />
              at <span className="text-emerald-600">independent pharmacies</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg">
              Real Prices. No Coupons. No Fees. Support local pharmacies.
              <br />
              Search cash prices and reserve with confidence.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              Search Prices Near You →
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1584308666744-7a4c2b6e0c0f"
              alt="Pharmacy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

