# Phase 1 Handoff — IPN Foundation Layer (Persistence + Dashboards)

## Scope completed
This handoff covers what’s already implemented in the repo for the “IPN foundation layer” requirements:

1. Prisma persistence models
- `Pharmacy`
  - Unique `npi`
  - Profile flags used by the MVP UI: `profileStatus`, `pricingPublished`, `reservationsEnabled`
- `PharmacyClaim`
  - Persists submitted payload as `submittedPayload: Json`
  - Has `status` for admin workflow
- `Reservation`
  - Stores `reservationNumber: String (unique)`
  - Stores submitted reservation inputs in `reservationInput: Json`
  - Stores computed pricing in `priceResult: Json`
- `ReservationCounter`
  - Stores daily sequential counter keyed by `yyMMdd`

**Files**
- `prisma/schema.prisma`

2. Seed: pharmacies from CSV
- Seeds pharmacies from: `data/ipn/retail-independent-outreach-priority.csv`
- Upserts into `Pharmacy` keyed by `npi`.

**Files**
- `prisma/seed/pharmacies.ts`
- `prisma/seed/index.ts`

3. Persist claim submissions
- Claim submission API:
  - Upserts placeholder `Pharmacy` if it doesn’t exist (to avoid user flow failure if seeding hasn’t run)
  - Creates a `PharmacyClaim` row with `submittedPayload`
  - Updates `Pharmacy.profileStatus` to `pending_claim`

**Files**
- `app/api/claim-submissions/route.ts`

4. Admin dashboard MVP (UI + actions)
- Admin page lists latest submissions:
  - `PharmacyClaim`
  - `Reservation`
- Admin actions API supports:
  - `APPROVED`
  - `REJECTED`
  - `NEEDS_MORE_INFO`

**Files**
- `app/admin/page.tsx`
- `app/api/admin-claim-actions/route.ts`

5. Pharmacy dashboard MVP (UI + actions)
- Pharmacy dashboard page shows:
  - pharmacy profile (from `Pharmacy`)
  - latest claims
  - latest reservations
- Pharmacy reservation action API supports reservation status transitions.

**Files**
- `app/pharmacy-dashboard/[npi]/page.tsx`
- `app/api/pharmacy-reservation-actions/route.ts`

6. Persist reservation submissions + sequential numbering (YYMMDD######)
- Reservation submission API:
  - Computes today `yyMMdd`
  - Reads/initializes `ReservationCounter.nextNumber`
  - Creates `Reservation` with:
    - `reservationNumber = YYMMDD + seq(6 digits zero-padded)`
    - stores `reservationInput` and `priceResult`
  - Increments `ReservationCounter.nextNumber`

**Files**
- `app/api/reservation-submissions/route.ts`

## Smoke test evidence (Phase 1)
Run:
- `npm run smoke:ipn`

Expected PASS indicators in output:
- `IPN FOUNDATION SMOKE TEST: PASS`
- Created claim ID
- Created reservation ID
- Generated reservation number matches the `YYMMDD######` format

## Important repo details
- DB provider is SQLite in `prisma/schema.prisma`.
- Prisma client wiring uses `prisma/config.ts` and `app/lib/ipn-db.ts`.

## Gate commands (Phase 1)
After any Phase 1 changes, verify:
- `npx prisma generate`
- `npm run lint`
- `npm run build`

## Status
Phase 1 is complete in the current codebase.

