import { strict as assert } from "node:assert";
import { db } from "../app/lib/ipn-db";
import Stripe from "stripe";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const TEST_EMAIL = "mbanwie@googlemail.com";
const TEST_NPI = "9999999999";
const TEST_PHARMACY = "IPNUS E2E TEST PHARMACY";
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey?.startsWith("sk_test_")) {
  throw new Error("E2E Stripe testing requires an sk_test_ key");
}
const stripeClient = new Stripe(stripeKey);
const testIntentIds = new Set<string>();

async function createTestAuthorization(userId: string) {
  const intent = await stripeClient.paymentIntents.create({ amount: 500, currency: "usd", capture_method: "manual", payment_method: "pm_card_visa", payment_method_types: ["card"], confirm: true, metadata: { ipnusUserId: userId, purpose: "reservation_no_show_fee" } });
  assert.equal(intent.status, "requires_capture");
  testIntentIds.add(intent.id);
  return intent.id;
}

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

async function cleanup() {
  for (const id of testIntentIds) {
    const intent = await stripeClient.paymentIntents.retrieve(id).catch(() => null);
    if (intent && !["succeeded", "canceled"].includes(intent.status)) await stripeClient.paymentIntents.cancel(id).catch(() => undefined);
  }
  await db.rewardTransaction.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.reservation.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.drugPrice.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.pharmacyMember.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.pharmacyClaim.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.claimInvite.deleteMany({ where: { pharmacyNpi: TEST_NPI } });
  await db.pharmacy.deleteMany({ where: { npi: TEST_NPI } });
}

async function main() {
  await cleanup();
  const user = await db.user.findUnique({ where: { email: TEST_EMAIL } });
  assert(user, "Authenticated E2E user is missing");
  const session = await db.session.findFirst({ where: { userId: user.id, expires: { gt: new Date() } }, orderBy: { expires: "desc" } });
  assert(session, "Active E2E session is missing");
  const headers = { cookie: `authjs.session-token=${session.sessionToken}` };

  const admin = await fetch(`${BASE_URL}/admin`, { headers, redirect: "manual" });
  assert.equal(admin.status, 200, "Admin dashboard should be available to the test admin");

  const claimResponse = await fetch(`${BASE_URL}/api/claim-submissions`, {
    method: "POST",
    body: form({ npi: TEST_NPI, pharmacyName: TEST_PHARMACY, contactName: "E2E Owner", roleTitle: "Owner", email: TEST_EMAIL, phone: "555-0100", message: "Automated E2E claim", assistanceSupportEnabled: "true", manufacturerAssistanceHelp: "true", foundationAssistanceHelp: "true", publicProgramHelp: "true", localAssistanceHelp: "true" }),
    redirect: "manual",
  });
  assert.equal(claimResponse.status, 303);
  const claim = await db.pharmacyClaim.findFirst({ where: { pharmacyNpi: TEST_NPI }, orderBy: { createdAt: "desc" } });
  assert(claim);

  const approvalResponse = await fetch(`${BASE_URL}/api/admin-claim-actions`, {
    method: "POST",
    headers,
    body: form({ claimId: claim.id, action: "APPROVED" }),
    redirect: "manual",
  });
  if (approvalResponse.status !== 200) console.error("Claim approval response:", await approvalResponse.text());
  assert.equal(approvalResponse.status, 200);
  const membership = await db.pharmacyMember.findUnique({ where: { pharmacyNpi_email: { pharmacyNpi: TEST_NPI, email: TEST_EMAIL } } });
  assert.equal(membership?.role, "OWNER");
  const claimedPharmacy = await db.pharmacy.findUnique({ where: { npi: TEST_NPI } });
  assert.equal(claimedPharmacy?.assistanceSupportEnabled, true);

  const csv = [
    "drugName,strength,quantity,cashPrice,productType,ndc",
    "Atorvastatin,20 mg,30,18.00,prescription,",
    "Ibuprofen,200 mg,100,9.99,otc,",
  ].join("\n");
  const upload = new FormData();
  upload.set("pharmacyNpi", TEST_NPI);
  upload.set("file", new File([csv], "ipnus-e2e-unified-prices.csv", { type: "text/csv" }));
  const uploadResponse = await fetch(`${BASE_URL}/api/pharmacy-prices/import`, { method: "POST", headers, body: upload });
  assert.equal(uploadResponse.status, 200);
  const uploadResult = await uploadResponse.json() as { created: number; errors: unknown[] };
  assert.equal(uploadResult.created, 2);
  assert.equal(uploadResult.errors.length, 0);

  const pharmacy = await db.pharmacy.findUnique({ where: { npi: TEST_NPI } });
  assert.equal(pharmacy?.pricingPublished, true);
  assert.equal(pharmacy?.reservationsEnabled, true);
  const prices = await db.drugPrice.findMany({ where: { pharmacyNpi: TEST_NPI } });
  assert.deepEqual(new Set(prices.map((price) => price.productType)), new Set(["prescription", "otc"]));

  const publicResults = await fetch(`${BASE_URL}/results?drug=Atorvastatin&strength=20%20mg&quantity=30&zip=78701`);
  assert.equal(publicResults.status, 200);
  assert((await publicResults.text()).includes(TEST_PHARMACY));

  const rxReservationResponse = await fetch(`${BASE_URL}/api/reservation-submissions`, {
    method: "POST",
    headers,
    body: form({ npi: TEST_NPI, drug: "Atorvastatin", strength: "20 mg", quantity: "30", zip: "78701", fulfillmentMethod: "pickup", firstName: "E2E", lastName: "Patient", phone: "555-0101", email: TEST_EMAIL, rxOnFile: "true", pointsRedeemed: "0", assistanceRequested: "true", stripePaymentIntentId: await createTestAuthorization(user.id) }),
    redirect: "manual",
  });
  assert.equal(rxReservationResponse.status, 303);
  const rxReservation = await db.reservation.findFirst({ where: { pharmacyNpi: TEST_NPI }, orderBy: { createdAt: "desc" } });
  assert(rxReservation);
  assert.equal(rxReservation.assistanceRequested, true);

  for (const action of ["PHARMACY_CONFIRMED", "READY_FOR_PICKUP"]) {
    const response: Response = await fetch(`${BASE_URL}/api/pharmacy-reservation-actions`, { method: "POST", headers, body: form({ reservationId: rxReservation.id, action }), redirect: "manual" });
    assert.equal(response.status, 303);
  }
  const completeRx = await fetch(`${BASE_URL}/api/pharmacy-reservation-actions`, { method: "POST", headers, body: form({ reservationId: rxReservation.id, action: "COMPLETED", actualPurchase: "100.00" }), redirect: "manual" });
  assert.equal(completeRx.status, 303);
  assert.equal((await db.reservation.findUnique({ where: { id: rxReservation.id } }))?.reservationFeeStatus, "released");
  let balance = await db.rewardTransaction.aggregate({ where: { userId: user.id }, _sum: { points: true } });
  assert.equal(balance._sum.points, 100);

  const otcReservationResponse = await fetch(`${BASE_URL}/api/reservation-submissions`, {
    method: "POST",
    headers,
    body: form({ npi: TEST_NPI, drug: "Ibuprofen", strength: "200 mg", quantity: "100", zip: "78701", fulfillmentMethod: "pickup", firstName: "E2E", lastName: "Patient", phone: "555-0101", email: TEST_EMAIL, pointsRedeemed: "100", stripePaymentIntentId: await createTestAuthorization(user.id) }),
    redirect: "manual",
  });
  assert.equal(otcReservationResponse.status, 303);
  const otcReservation = await db.reservation.findFirst({ where: { pharmacyNpi: TEST_NPI, id: { not: rxReservation.id } }, orderBy: { createdAt: "desc" } });
  assert(otcReservation);
  assert.equal(otcReservation.prescriptionStatus, "not_required");
  assert.equal(otcReservation.rewardDiscountCents, 100);

  const completeOtc = await fetch(`${BASE_URL}/api/pharmacy-reservation-actions`, { method: "POST", headers, body: form({ reservationId: otcReservation.id, action: "COMPLETED", actualPurchase: "9.99" }), redirect: "manual" });
  assert.equal(completeOtc.status, 303);
  assert.equal((await db.reservation.findUnique({ where: { id: otcReservation.id } }))?.reservationFeeStatus, "released");
  balance = await db.rewardTransaction.aggregate({ where: { userId: user.id }, _sum: { points: true } });
  assert.equal(balance._sum.points, 10);

  const noShowResponse = await fetch(`${BASE_URL}/api/reservation-submissions`, { method: "POST", headers, body: form({ npi: TEST_NPI, drug: "Ibuprofen", strength: "200 mg", quantity: "100", zip: "78701", fulfillmentMethod: "pickup", firstName: "E2E", lastName: "NoShow", phone: "555-0102", email: TEST_EMAIL, pointsRedeemed: "0", stripePaymentIntentId: await createTestAuthorization(user.id) }), redirect: "manual" });
  assert.equal(noShowResponse.status, 303);
  const noShowReservation = await db.reservation.findFirst({ where: { pharmacyNpi: TEST_NPI, id: { notIn: [rxReservation.id, otcReservation.id] } }, orderBy: { createdAt: "desc" } });
  assert(noShowReservation);
  const earlyNoShow = await fetch(`${BASE_URL}/api/pharmacy-reservation-actions`, { method: "POST", headers, body: form({ reservationId: noShowReservation.id, action: "NO_SHOW" }), redirect: "manual" });
  assert.equal(earlyNoShow.status, 400);
  await db.reservation.update({ where: { id: noShowReservation.id }, data: { noShowEligibleAt: new Date(Date.now() - 1000) } });
  const captureResponse = await fetch(`${BASE_URL}/api/pharmacy-reservation-actions`, { method: "POST", headers, body: form({ reservationId: noShowReservation.id, action: "NO_SHOW" }), redirect: "manual" });
  assert.equal(captureResponse.status, 303);
  const capturedNoShow = await db.reservation.findUnique({ where: { id: noShowReservation.id } });
  assert.equal(capturedNoShow?.reservationFeeStatus, "charged");
  assert.equal(capturedNoShow?.status, "NO_SHOW");

  console.log("IPNUS CORE E2E: PASS");
  console.log("Verified: email auth, admin access, claim approval, pharmacy ownership, assistance support, unified Rx/OTC upload, public search, assistance request, Rx reservation, Stripe authorization release, fulfillment, points earning, OTC reservation, network redemption, and Stripe test-mode $5 no-show capture.");
  await cleanup();
  console.log("Controlled E2E fixture cleaned up.");
  await db.$disconnect();
  process.exit(0);
}

main().catch(async (error) => {
  console.error(error);
  await cleanup().catch(() => undefined);
  await db.$disconnect().catch(() => undefined);
  process.exitCode = 1;
});
