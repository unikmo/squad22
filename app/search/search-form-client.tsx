"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  drugs: { name: string }[];
};

export function SearchFormClient({ drugs }: Props) {
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
    <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-900">Drug name</label>
          <div className="relative">
            <input
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
          <label className="block text-sm font-medium text-gray-900">Dosage/strength (optional)</label>
          <input
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="e.g., 10mg"
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Location</label>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="ZIP, street, or city"
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="mt-2">
            <button
              type="button"
              className="text-sm text-emerald-700 hover:text-emerald-800 underline"
            >
              Use my current location
            </button>
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

