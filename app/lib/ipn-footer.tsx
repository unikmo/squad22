import Link from "next/link";

const links = [["Search Prices", "/search"], ["Assistance", "/assistance"], ["How It Works", "/how-it-works"], ["For Pharmacies", "/claim"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]] as const;

export function IPNFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div><div className="text-xl font-black text-white">IPNUS</div><p className="mt-2 max-w-md">Low cash prescription prices from participating independent pharmacies.</p></div>
          <div className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-sm">{links.map(([label, href]) => <Link key={href} href={href} className="hover:text-white">{label}</Link>)}</div>
        </div>
        <p className="mt-8 border-t border-slate-800 pt-6 text-xs text-slate-400">Prices are published by participating pharmacies and may require confirmation. Assistance options vary and are not guaranteed.</p>
        <p className="mt-2 text-xs text-slate-500">IPNUS does not determine eligibility, guarantee medication availability, or guarantee assistance approval. Prices and assistance options must be confirmed by the pharmacy or relevant program provider.</p>
      </div>
    </footer>
  );
}
