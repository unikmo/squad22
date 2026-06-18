import Link from "next/link";

export function IPNNav() {
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-emerald-600">IPNUS</div>
          <span className="text-gray-500 font-medium">Independent Pharmacy Network</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link href="/search" className="hover:text-emerald-600">
            Search Prices
          </Link>
          <Link href="/pricing" className="hover:text-emerald-600">
            For Pharmacies
          </Link>
          <Link href="/login" className="text-emerald-600 font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}

