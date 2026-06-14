import { IPNNav } from "../lib/ipn-nav";
import { db } from "../lib/ipn-db";

export default async function AdminPage() {
  const claims = await db.pharmacyClaim.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reservations = await db.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin dashboard (MVP)</h1>
          <p className="text-gray-600 mt-2">Claims and reservation submissions.</p>
        </div>

        <div className="grid gap-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">Pharmacy claims</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border-b">Claim ID</th>
                    <th className="text-left p-3 border-b">NPI</th>
                    <th className="text-left p-3 border-b">Status</th>
                    <th className="text-left p-3 border-b">Created</th>
                    <th className="text-left p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c: { id: string; pharmacyNpi: string; status: string; createdAt: Date }) => (
                    <tr key={c.id}>
                      <td className="p-3 border-b font-mono">{c.id}</td>
                      <td className="p-3 border-b font-mono">{c.pharmacyNpi}</td>
                      <td className="p-3 border-b">{c.status}</td>
                      <td className="p-3 border-b">{new Date(c.createdAt).toLocaleString()}</td>
                      <td className="p-3 border-b">
                        <div className="flex flex-wrap gap-2">
                          <form action="/api/admin-claim-actions" method="post">
                            <input type="hidden" name="claimId" value={c.id} />
                            <input type="hidden" name="action" value="APPROVED" />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                              Approve
                            </button>
                          </form>

                          <form action="/api/admin-claim-actions" method="post">
                            <input type="hidden" name="claimId" value={c.id} />
                            <input type="hidden" name="action" value="REJECTED" />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </form>

                          <form action="/api/admin-claim-actions" method="post">
                            <input type="hidden" name="claimId" value={c.id} />
                            <input type="hidden" name="action" value="NEEDS_MORE_INFO" />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                            >
                              Needs more info
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {claims.length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={5}>
                        No claims yet.
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
                    <th className="text-left p-3 border-b">NPI</th>
                    <th className="text-left p-3 border-b">Status</th>
                    <th className="text-left p-3 border-b">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(
                    (r: {
                      id: string;
                      reservationNumber: string;
                      pharmacyNpi: string;
                      status: string;
                      createdAt: Date;
                    }) => (
                      <tr key={r.id}>
                        <td className="p-3 border-b font-mono">{r.reservationNumber}</td>
                        <td className="p-3 border-b font-mono">{r.pharmacyNpi}</td>
                        <td className="p-3 border-b">{r.status}</td>
                        <td className="p-3 border-b">{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ),
                  )}

                  {reservations.length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={4}>
                        No reservations yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


