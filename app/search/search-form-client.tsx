"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  drugs: { name: string }[];
  showLocationButton?: boolean;
};

export function SearchFormClient({ drugs, showLocationButton = true }: Props) {
  const [drug, setDrug] = useState("");
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState<number>(30);
  const [zip, setZip] = useState("");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const router = useRouter();

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return drugs
      .filter((d) => d.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((d) => d.name);
  }, [query, drugs]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!drug.trim()) return;
    const safeZip = zip.trim();

    router.push(
      `/results?drug=${encodeURIComponent(drug.trim())}` +
        `&strength=${encodeURIComponent(strength.trim())}` +
        `&quantity=${encodeURIComponent(String(quantity))}` +
        `&zip=${encodeURIComponent(safeZip)}`
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">Medication</label>
          <div className="text-xs text-gray-500">You can also scan your prescription (optional).</div>

          <div className="mt-2 rounded-xl border bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <span aria-hidden>📷</span>
              <span>Scan / upload prescription</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={() => {
                  // MVP: file is collected on the client, but pricing search still uses the entered fields.
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <div className="relative">
            <input
              id="drug-search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                const directMatch = drugs.find(
                  (d) => d.name.toLowerCase() === e.target.value.toLowerCase()
                );
                if (directMatch) setDrug(directMatch.name);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Start typing…"
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      setDrug(s);
                      setQuery(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input type="hidden" value={drug} />
          {!drug.trim() && (
            <div className="text-xs text-amber-700 mt-2">Select a suggestion to continue.</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">ZIP code</label>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="e.g. 22110"
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
            inputMode="numeric"
            autoComplete="postal-code"
          />

          {showLocationButton ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  // No geolocation support in this MVP.
                }}
                className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-lg"
                aria-disabled="true"
                title="Current location search is coming soon. Please enter a ZIP code."
              >
                Use my current location
              </button>
              <div className="mt-2 text-xs text-amber-800">
                Current location search is coming soon. Please enter a ZIP code.
              </div>
            </div>
          ) : null}

          <div className="mt-2 text-xs text-gray-500">Optional details below</div>

          <div className="mt-3 rounded-xl border bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Optional details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-900">Strength</label>
                <input
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="10mg"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-900">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Search prices
        </button>
      </div>
    </form>
  );
}

