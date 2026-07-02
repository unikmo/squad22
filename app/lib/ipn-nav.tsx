import Link from "next/link";

export function IPNNav() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="text-3xl font-bold text-emerald-600">IPNUS</div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-700">
              Real prescription prices
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          <Link
            href="/search"
            className="text-gray-700 transition hover:text-emerald-600"
          >
            Search Prices
          </Link>

          <Link
            href="/claim"
            className="text-gray-700 transition hover:text-emerald-600"
          >
            For Pharmacies
          </Link>

          <Link
            href="/login"
            className="font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}