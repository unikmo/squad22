import Link from "next/link";


export function PharmacyNameLink({ npi, name }: { npi: string; name: string }) {
  return (
    <Link href={`/pharmacy/${encodeURIComponent(npi)}`} className="hover:text-emerald-700">
      {name}
    </Link>
  );
}

