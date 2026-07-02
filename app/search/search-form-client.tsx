"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  drugs: { name: string }[];
  showLocationButton?: boolean;
};

export function SearchFormClient({ drugs, showLocationButton = true }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    <form onSubmit={submit} className="bg-white p-0 shadow-sm">
      <div className="grid gap-3">
        {/* Upload/scan (no extra frame) */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">Upload prescription</div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition inline-flex items-center justify-center"
            >
              Upload / scan
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const fd = new FormData();
                fd.append("prescription", file);

                try {
                  const res = await fetch("/api/ocr", {
                    method: "POST",
                    body: fd,
                  });

                  if (!res.ok) return;

                  const data = (await res.json()) as {
                    drug?: string | null;
                    strength?: string | null;
                    quantity?: number | null;
                  };

                  if (data.drug) {
                    setDrug(data.drug);
                    setQuery(data.drug);
                  }
                  if (data.strength) setStrength(data.strength);
                  if (typeof data.quantity === "number" && Number.isFinite(data.quantity)) {
                    setQuantity(data.quantity);
                  }
                } catch {
                  // ignore
                }
              }}
            />
          </div>
        </div>

        {/* Medication */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">Medication</label>
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
              placeholder="Medication"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow-sm overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50"
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
        </div>

        {/* Strength + quantity: tighter, no big frame */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-900">Strength</label>
            <input
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="Optional"
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

        {/* ZIP LAST */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">ZIP</label>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="ZIP"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
            inputMode="numeric"
            autoComplete="postal-code"
          />

          {showLocationButton ? (
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return;

                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    // MVP placeholder without reverse geocoding.
                    setZip(String(Math.round(pos.coords.latitude)) || "");
                  },
                  () => {},
                  { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 }
                );
              }}
              className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-lg"
              title="Use your current location"
            >
              Use my current location
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Search prices
        </button>
      </div>
    </form>
  );
}

