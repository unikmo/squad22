import Link from "next/link";
import { auth, signOut } from "../../auth";

const links = [
  ["Search Prices", "/search"],
  ["Assistance", "/assistance"],
  ["How It Works", "/how-it-works"],
  ["For Pharmacies", "/claim"],
] as const;

export async function IPNNav() {
  const session = await auth();
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-emerald-700">IPNUS</Link>
        <div className="flex items-center justify-end gap-x-5 gap-y-2 overflow-x-auto text-sm font-semibold text-slate-700">
          {links.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap hover:text-emerald-700">{label}</Link>)}
          {session?.user ? <><Link href="/rewards" className="whitespace-nowrap text-emerald-700 hover:text-emerald-800">IP Rewards</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="whitespace-nowrap text-slate-600 hover:text-emerald-800">Sign out</button></form></> : <Link href="/login" className="whitespace-nowrap text-emerald-700 hover:text-emerald-800">Sign in</Link>}
        </div>
      </div>
    </nav>
  );
}
