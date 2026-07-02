"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchFormClient({ drugs }: { drugs: { name: string }[] }) {
  const [drug, setDrug] = useState("");
  const [strength, setStrength] = useState("");
  const [quantity, setQuantity] = useState(30);
  const [zip, setZip] = useState("");
  const [attempted, setAttempted] = useState(false);
  const router = useRouter();
  const suggestions = useMemo(() => drug.trim() ? drugs.filter((d) => d.name.toLowerCase().includes(drug.trim().toLowerCase())).slice(0, 8) : [], [drug, drugs]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAttempted(true);
    if (!drug.trim()) return;
    router.push(`/results?drug=${encodeURIComponent(drug.trim())}&strength=${encodeURIComponent(strength.trim())}&quantity=${encodeURIComponent(String(Math.max(1, quantity || 1)))}&zip=${encodeURIComponent(zip.trim())}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      <div className="grid gap-4">
        <label className="text-sm font-semibold text-slate-800">Medication
          <input list="drug-suggestions" value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="e.g. Atorvastatin" autoComplete="off" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
          <datalist id="drug-suggestions">{suggestions.map((d) => <option key={d.name} value={d.name} />)}</datalist>
        </label>
        {attempted && !drug.trim() ? <p className="text-sm font-medium text-red-700" role="alert">Enter a medication to search prices.</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">Strength<input value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="e.g. 20 mg" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" /></label>
          <label className="text-sm font-semibold text-slate-800">Quantity<input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" /></label>
        </div>
        <label className="text-sm font-semibold text-slate-800">ZIP<input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 78701" inputMode="numeric" autoComplete="postal-code" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" /></label>
        {attempted && !zip.trim() ? <p className="text-sm text-amber-800">ZIP helps us show nearby pharmacies.</p> : null}
        <button type="submit" className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800">Find Prices</button>
      </div>
    </form>
  );
}
