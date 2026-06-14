# TODO - IPN Foundation Layer

## Step 1: Prisma foundation
- [ ] Add `prisma/schema.prisma` with models: Pharmacy, PharmacyClaim, Reservation, ReservationCounter
- [ ] Add Prisma dependencies (`prisma`, `@prisma/client`) and scripts (`prisma generate`, `prisma db seed`)
- [ ] Add env wiring instructions (DATABASE_URL)

## Step 2: Seed pharmacies
- [ ] Implement `prisma/seed/pharmacies.ts` (seed:pharmacies) reading `data/ipn/retail-independent-outreach-priority.csv`
- [ ] Wire seed runner so `npm run seed:pharmacies` (or `prisma db seed`) works

## Step 3: Persist submissions
- [ ] Add persistence helpers for PharmacyClaim: create/read by NPI
- [ ] Add persistence helpers for Reservation: create reservation + sequential reservation number YYMMDD###### using ReservationCounter

## Step 4: Replace in-memory stores
- [ ] Update `app/lib/ipn-claims-store.ts` and `app/lib/ipn-mock-data.ts` to use DB persistence

## Step 5: Admin dashboard MVP
- [ ] Add admin dashboard route: list PharmacyClaim + Reservation submissions
- [ ] Add admin route for counters/status

## Step 6: Pharmacy dashboard MVP
- [ ] Add pharmacy dashboard route: list that pharmacy's Reservation + claims status

## Step 7: Validation & run
- [ ] Run: `npx prisma generate`
- [ ] Run: `npm run lint`
- [ ] Run: `npm run build`

