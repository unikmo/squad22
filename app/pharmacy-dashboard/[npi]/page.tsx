import { IPNNav } from "../../../app/lib/ipn-nav";
import { db } from "../../../app/lib/ipn-db";
import Link from "next/link";

export default async function PharmacyDashboardPage({
  params,
}: {
  params: { npi: string };
}) {
  const npi = params.npi;

  const pharmacy = await db.pharmacy.findUnique({ where: { npi } });
  const claims = await db.pharmacyClaim.findMany({
    where: { pharmacyNpi: npi },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const reservations = await db.reservation.findMany({
    where: { pharmacyNpi: npi },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pharmacy dashboard</h1>
          <p className="text-gray-600 mt-2">
            NPI: <span className="font-mono">{npi}</span>
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <div className="mt-3 rounded-xl border p-4">
            <div className="text-sm text-gray-500">Name</div>
            <div className="font-semibold text-gray-900">{pharmacy?.name ?? "—"}</div>
            <div className="text-sm text-gray-500 mt-3">Address</div>
            <div className="text-gray-900">
              {pharmacy?.address1 || "—"}
              {pharmacy?.address2 ? `, ${pharmacy.address2}` : null}
            </div>
            <div className="text-gray-900">
              {(pharmacy?.city ?? "—")}, {(pharmacy?.state ?? "—")} {(pharmacy?.zip ?? "—")}
            </div>
          </div>

          <div className="mt-3 flex gap-3">
            <Link
              href={`/pharmacy/${encodeURIComponent(npi)}`}
              className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-900 px-4 py-2 rounded-xl font-semibold transition"
            >
              View public profile
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900">Claims</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Claim ID</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-left p-3 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c: { id: string; status: string; createdAt: Date }) => (
                  <tr key={c.id}>
                    <td className="p-3 border-b font-mono">{c.id}</td>
                    <td className="p-3 border-b">{c.status}</td>
                    <td className="p-3 border-b">{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}

                {claims.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      No claims.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Reservations</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b">Reservation #</th>
                  <th className="text-left p-3 border-b">Status</th>
                  <th className="text-left p-3 border-b">Created</th>
                  <th className="text-left p-3 border-b">Update</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r: { id: string; reservationNumber: string; status: string; createdAt: Date }) => (
                  <tr key={r.id}>
                    <td className="p-3 border-b font-mono">{r.reservationNumber}</td>
                    <td className="p-3 border-b">{r.status}</td>
                    <td className="p-3 border-b">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-3 border-b">
                      <div className="flex flex-wrap gap-2">
                        <form action="/api/pharmacy-reservation-actions" method="post">
                          <input type="hidden" name="reservationId" value={r.id} />
                          <input type="hidden" name="action" value="PHARMACY_CONFIRMED" />
                          <button type="submit" className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                            Confirm
                          </button>
                        </form>

                        <form action="/api/pharmacy-reservation-actions" method="post">
                          <input type="hidden" name="reservationId" value={r.id} />
                          <input type="hidden" name="action" value="READY_FOR_PICKUP" />
                          <button type="submit" className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                            Ready
                          </button>
                        </form>

                        <form action="/api/pharmacy-reservation-actions" method="post">
                          <input type="hidden" name="reservationId" value={r.id} />
                          <input type="hidden" name="action" value="COMPLETED" />
                          <button type="submit" className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold">
                            Complete
                          </button>
                        </form>

                        <form action="/api/pharmacy-reservation-actions" method="post">
                          <input type="hidden" name="reservationId" value={r.id} />
                          <input type="hidden" name="action" value="DECLINED_BY_PHARMACY" />
                          <button type="submit" className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
                            Decline
                          </button>
                        </form>

                        <form action="/api/pharmacy-reservation-actions" method="post">
                          <input type="hidden" name="reservationId" value={r.id} />
                          <input type="hidden" name="action" value="NO_SHOW" />
                          <button type="submit" className="px-2 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold">
                            No-show
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {reservations.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={4}>
                      No reservations.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

