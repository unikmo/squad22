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

  const totalPharmacies = await db.pharmacy.count();
  const activeInvites = await db.claimInvite.count({ where: { status: "active" } });
  const usedInvites = await db.claimInvite.count({ where: { status: "used" } });
  const invited = await db.claimInvite.count({ where: { status: { in: ["active", "used"] } } });

  const claimSubmitted = await db.pharmacy.count({ where: { outreachStatus: "claim_submitted" } });
  const claimed = await db.pharmacy.count({ where: { profileStatus: "claimed" } });

  const missingEmail = await db.pharmacy.count({ where: { email: null } });
  const missingWebsite = await db.pharmacy.count({ where: { website: null } });

  const recentInvites = await db.claimInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { pharmacy: true },
  });

  async function createInviteAction(formData: FormData) {
    "use server";
    const pharmacyNpi = String(formData.get("pharmacyNpi") ?? "").trim();
    if (!pharmacyNpi) return;

    const token = `ci_${pharmacyNpi}_${Date.now()}`;

    await db.claimInvite.create({
      data: {
        token,
        pharmacyNpi,
        status: "active",
        expiresAt: null,
        metadata: undefined,
      },

    });
  }

  return (
    <div className="min-h-screen bg-white">
      <IPNNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin dashboard (Phase 3)</h1>
          <p className="text-gray-600 mt-2">Outreach onboarding pipeline, claims, and reservation submissions.</p>
        </div>

        <div className="grid gap-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">Outreach pipeline</h2>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4 bg-white">
                <div className="text-sm text-gray-500">Totals</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-800 px-3 py-1 text-xs font-semibold border border-gray-100">
                    Total pharmacies: {totalPharmacies}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <div className="text-sm text-gray-500">Invites</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold border border-emerald-100">
                    Invited: {invited}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold border border-emerald-100">
                    Active invites: {activeInvites}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-800 px-3 py-1 text-xs font-semibold border border-gray-100">
                    Used invites: {usedInvites}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <div className="text-sm text-gray-500">Claim activation</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-xs font-semibold border border-blue-100">
                    Claim submitted: {claimSubmitted}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold border border-emerald-100">
                    Claimed: {claimed}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <div className="text-sm text-gray-500">Missing enrichment</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold border border-amber-100">
                    Missing email: {missingEmail}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold border border-amber-100">
                    Missing website: {missingWebsite}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border overflow-x-auto">
              <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Recent invites</div>
                  <div className="font-semibold text-gray-900 mt-1">Last {recentInvites.length} invite records</div>
                </div>

                <form action={createInviteAction} className="flex gap-2 items-center">
                  <input
                    name="pharmacyNpi"
                    placeholder="Pharmacy NPI"
                    className="rounded-xl border px-3 py-2 text-sm"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Create invite
                  </button>
                </form>
              </div>

              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border-b">Token</th>
                    <th className="text-left p-3 border-b">NPI</th>
                    <th className="text-left p-3 border-b">Status</th>
                    <th className="text-left p-3 border-b">Created</th>
                    <th className="text-left p-3 border-b">Used claim</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvites.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-3 border-b font-mono">{inv.token}</td>
                      <td className="p-3 border-b font-mono">{inv.pharmacyNpi}</td>
                      <td className="p-3 border-b">{inv.status}</td>
                      <td className="p-3 border-b">{new Date(inv.createdAt).toLocaleString()}</td>
                      <td className="p-3 border-b font-mono">{inv.usedClaimId ?? "-"}</td>
                    </tr>
                  ))}

                  {recentInvites.length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={5}>
                        No invites yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

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





