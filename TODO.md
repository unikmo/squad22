# TODO

## Pricing architecture enforcement (DrugPrice as single source of truth)

### Step 1 — Implement DB-backed pricing for consumer results
- Update `app/results/page.tsx` to query `DrugPrice` records by `(pharmacyNpi, drugName, strength, quantity, status="active")`.
- If no `DrugPrice` match exists for a pharmacy, show `Price not published yet`.
- Remove mock pricing usage (`PHARMACIES`, `computePriceResult`).

### Step 2 — Implement DB-backed pricing for reservation page
- Update `app/reserve/page.tsx` to fetch the selected pharmacy’s `DrugPrice` record(s).
- Render reservation price strictly from stored `cashPriceCents` (no theoretical/markup formulas).
- Ensure the reservation form posts only fields needed to persist the real price.

### Step 3 — Enforce server-side price validation on reservation submission
- Update `app/api/reservation-submissions/route.ts` to recompute/validate `priceResult` from `DrugPrice`.
- Reject (400) if no matching `DrugPrice` exists.
- Ensure `Reservation.priceResult` reflects real stored `DrugPrice` values.

### Step 4 — Detach any remaining consumer usage of mock pricing
- Verify `app/lib/ipn-mock-data.ts` is not used by consumer flows.
- Adjust/remove references as needed.

### Step 5 — Testing
- Run `npm run lint` (if present).
- Run `npm test` (if present).
- Manual flow test: CSV upload → Search/Results → Reserve → Confirm.
- Run `node scripts/smoke-ipn-foundation.ts` (may need update if reservation requires DrugPrice rows).

