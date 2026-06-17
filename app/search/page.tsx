import { IPNNav } from "../lib/ipn-nav";
import { getTopDrugSuggestions } from "../lib/ipn-mock-data";

import { SearchFormClient } from "./search-form-client";

export default function SearchPage() {
  const drugs = getTopDrugSuggestions();

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Search real cash prices</h1>
          <p className="text-gray-600 mt-2">
            Enter your medication and ZIP code. We’ll show independent pharmacies with realistic price ranges.
          </p>
        </div>

        <SearchFormClient drugs={drugs} />

        <div className="mt-8 rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">Real pricing & reservations</div>
          <div>Search cash prices and reserve with participating independent pharmacies.</div>
        </div>
      </div>
    </div>
  );
}

