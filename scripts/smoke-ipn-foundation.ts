import "dotenv/config";
import { db } from "../app/lib/ipn-db";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayYYMMDD(d = new Date()) {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yy}${mm}${dd}`;
}

function isYYMMDDHexReservationNumber(value: string) {
  // YYMMDD######
  return /^\d{6}\d{6}$/.test(value);
}

function render(report: {
  ok: boolean;
  errors: string[];
  selectedPharmacyNpi?: string;
  claimId?: string;
  reservationId?: string;
  reservationNumber?: string;
}) {
  const lines: string[] = [];
  lines.push(`IPN FOUNDATION SMOKE TEST: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push(`Selected pharmacy NPI: ${report.selectedPharmacyNpi ?? "-"}`);
  lines.push(`Created claim ID: ${report.claimId ?? "-"}`);
  lines.push(`Created reservation ID: ${report.reservationId ?? "-"}`);
  lines.push(`Generated reservationNumber: ${report.reservationNumber ?? "-"}`);
  const reservationFeeCents = (report as { reservationFeeCents?: number }).reservationFeeCents;
  const reservationFeeStatus = (report as { reservationFeeStatus?: string }).reservationFeeStatus;
  if (typeof reservationFeeCents === "number") {
    lines.push(`Reservation fee: ${reservationFeeCents} cents`);
  }
  lines.push(`Reservation fee status: ${reservationFeeStatus ?? "-"}`);


  if (report.errors.length) {
    lines.push("Errors:");
    for (const err of report.errors) lines.push(`- ${err}`);
  }
  return lines.join("\n");
}

async function getOrCreateTodayCounter() {
  const yyMMdd = todayYYMMDD();
  await db.reservationCounter.upsert({
    where: { yyMMdd },
    update: {},
    create: { id: yyMMdd, yyMMdd, nextNumber: 1 },
  });
  return yyMMdd;
}

async function main() {
  const report: {
    ok: boolean;
    errors: string[];
    selectedPharmacyNpi?: string;
    claimId?: string;
    reservationId?: string;
    reservationNumber?: string;
  } = { ok: false, errors: [] };

  // Keep created IDs for cleanup.
  let createdClaimId: string | undefined;
  let createdReservationId: string | undefined;

  try {
    const pharmacy = await db.pharmacy.findFirst({
      orderBy: { createdAt: "asc" },
      select: { npi: true },
    });

    if (!pharmacy) {
      report.errors.push("No seeded Pharmacy rows found. Run Prisma seed first.");
      console.log(render(report));
      return;
    }

    const selectedPharmacyNpi = pharmacy.npi;
    report.selectedPharmacyNpi = selectedPharmacyNpi;

    await db.pharmacy.update({
      where: { npi: selectedPharmacyNpi },
      data: { profileStatus: "pending_claim" },
    });

    const testMessage = `SMOKE_${Date.now()}`;

    // 1) claim submission path: simulate the API request by invoking the same DB operations the API performs.
    // (This smoke test is DB-level to avoid HTTP client complexity in this environment.)
    const claim = await db.pharmacyClaim.create({
      data: {
        pharmacyNpi: selectedPharmacyNpi,
        status: "unclaimed",
        submittedPayload: {
          smoke: true,
          marker: testMessage,
        },
      },
      select: { id: true },
    });
    createdClaimId = claim.id;
    report.claimId = claim.id;

    await db.pharmacy.update({
      where: { npi: selectedPharmacyNpi },
      data: { profileStatus: "pending_claim" },
    });

    // Ensure admin-visible rows exist later.


    // 2) reservation submission: ReservationCounter-based sequential reservation number
    const yyMMdd = await getOrCreateTodayCounter();
    const counter = await db.reservationCounter.findUnique({ where: { yyMMdd } });
    const nextNumber = counter?.nextNumber ?? 1;
    const reservationNumber = `${yyMMdd}${String(nextNumber).padStart(6, "0")}`;

    if (!isYYMMDDHexReservationNumber(reservationNumber)) {
      report.errors.push(`reservationNumber format invalid: ${reservationNumber}`);
    }

    const reservationId = `r-smoke-${selectedPharmacyNpi}-${reservationNumber}`;

    const createdReservation = await db.reservation.create({
      data: {
        id: reservationId,
        reservationNumber,
        status: "pending",
        pharmacyNpi: selectedPharmacyNpi,
        reservationInput: {
          smoke: true,
          marker: testMessage,
          fullName: "Smoke Tester",
          phone: "",
          email: null,
          rxUpload: null,
          notes: null,
        },
        priceResult: {
          smoke: true,
          marker: testMessage,
          reservePrice: 10,
          currency: "USD",
          priceLow: 8,
          priceHigh: 12,
          drug: "SMOKE_DRUG",
          strength: null,
          quantity: 30,
          zip: "00000",
        },
      },
      select: {
        id: true,
        reservationNumber: true,
        pharmacyNpi: true,
        reservationFeeCents: true,
        reservationFeeStatus: true,
      },
    });

    createdReservationId = createdReservation.id;
      report.reservationId = createdReservation.id;
      report.reservationNumber = createdReservation.reservationNumber;
      (report as { reservationFeeCents?: number }).reservationFeeCents = createdReservation.reservationFeeCents;
      (report as { reservationFeeStatus?: string }).reservationFeeStatus = createdReservation.reservationFeeStatus;

      if (createdReservation.reservationFeeCents !== 500) {


        report.errors.push(`reservationFeeCents default mismatch: expected 500, got ${createdReservation.reservationFeeCents}`);
      }
      if (createdReservation.reservationFeeStatus !== "waived") {
        report.errors.push(`reservationFeeStatus default mismatch: expected "waived", got ${createdReservation.reservationFeeStatus}`);
      }


    await db.reservationCounter.upsert({
      where: { yyMMdd },
      update: { nextNumber: nextNumber + 1 },
      create: { id: yyMMdd, yyMMdd, nextNumber: nextNumber + 1 },
    });

    // 3) verify DB existence for admin-visible rows
    const adminClaims = await db.pharmacyClaim.findMany({
      where: { id: createdClaimId },
      select: { id: true },
    });
    if (adminClaims.length !== 1) report.errors.push("Admin-visible claim row missing.");

    const adminReservations = await db.reservation.findMany({
      where: { id: createdReservationId },
      select: { id: true, reservationNumber: true },
    });
    if (adminReservations.length !== 1) report.errors.push("Admin-visible reservation row missing.");

    if (
      adminReservations[0] &&
      !adminReservations[0].reservationNumber.startsWith(yyMMdd)
    ) {
      report.errors.push(
        `reservationNumber does not start with today's yyMMdd (${yyMMdd}): ${adminReservations[0].reservationNumber}`,
      );
    }

    // 4) verify pharmacy-dashboard-visible rows
    const dashReservations = await db.reservation.findMany({
      where: { pharmacyNpi: selectedPharmacyNpi, id: createdReservationId },
      select: { id: true, reservationNumber: true },
    });
    if (dashReservations.length !== 1) report.errors.push("Pharmacy-dashboard-visible reservation row missing.");

    const dashClaims = await db.pharmacyClaim.findMany({
      where: { pharmacyNpi: selectedPharmacyNpi, id: createdClaimId },
      select: { id: true },
    });
    if (dashClaims.length !== 1) report.errors.push("Pharmacy-dashboard-visible claim row missing.");

    report.ok = report.errors.length === 0;
    console.log(render(report));

    // Cleanup
    await db.reservation.delete({ where: { id: createdReservationId! } });
    await db.pharmacyClaim.delete({ where: { id: createdClaimId! } });

    await db.pharmacy.update({
      where: { npi: selectedPharmacyNpi },
      data: { profileStatus: "unclaimed" },
    });
  } catch (e) {
    report.errors.push(e instanceof Error ? e.message : String(e));
    report.ok = false;
    console.log(render(report));

    // Best-effort cleanup
    try {
      if (createdReservationId) {
        await db.reservation.delete({ where: { id: createdReservationId } });
      }
    } catch {}
    try {
      if (createdClaimId) {
        await db.pharmacyClaim.delete({ where: { id: createdClaimId } });
      }
    } catch {}
  }
  finally {
    await db.$disconnect();
  }
}

main();

