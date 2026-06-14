# IPN MVP Status (Foundation Layer)

## Completed functionality
- **Prisma persistence foundation**
  - Models: `Pharmacy`, `PharmacyClaim`, `Reservation`, `ReservationCounter`
  - Unique keying for `Pharmacy` by `npi`
  - Reservation numbering contract supported via `ReservationCounter` keyed by `yyMMdd`

- **Seed**
  - `prisma/seed/pharmacies.ts` seeds `Pharmacy` from `data/ipn/retail-independent-outreach-priority.csv`
  - Seed entrypoint: `prisma/seed/index.ts`

- **Claim submissions persistence**
  - API: `app/api/claim-submissions/route.ts`

- **Admin dashboard MVP + admin actions**
  - Dashboard: `app/admin/page.tsx`
  - Actions API: `app/api/admin-claim-actions/route.ts`
    - `APPROVED`
    - `REJECTED`
    - `NEEDS_MORE_INFO`

- **Reservation submissions persistence + sequential reservation numbers**
  - API: `app/api/reservation-submissions/route.ts`
  - Reservation number format: `YYMMDD######` (YYMMDD + 6-digit sequential counter for the day)

- **Pharmacy dashboard MVP + pharmacy actions**
  - Dashboard: `app/pharmacy-dashboard/[npi]/page.tsx`
  - Actions API: `app/api/pharmacy-reservation-actions/route.ts`
    - `PHARMACY_CONFIRMED`
    - `READY_FOR_PICKUP`
    - `COMPLETED`
    - `DECLINED_BY_PHARMACY`
    - `NO_SHOW`

- **Reserve form wiring fix**
  - `app/reserve/page.tsx` corrected hidden inputs to submit `npi` and `pharmacyNpi` consistently.

- **Smoke workflow verification**
  - Smoke test: `scripts/smoke-ipn-foundation.ts`
  - Verifies:
    - Claim persistence
    - Reservation persistence
    - Reservation number format `YYMMDD######`

## Deferred functionality
- Storage of prescription uploads to file/object storage (UI indicates MVP storage omitted).
- UI wiring of admin/pharmacy actions into the full confirmation flows (MVP supports actions at API + dashboards; the rest of the UI can be iterated).
- Any authentication/authorization layer (admin/pharmacy actions are currently available without auth).

## Known limitations
- Pharmacy reservation action transitions are a simple status update (no additional business-rule validation yet).
- Reservation counter is per-day, and the sequential number is allocated optimistically within the submission flow (adequate for MVP; further concurrency-hardening may be added later).

## Verification performed
- `npm run smoke:ipn` ✅ PASS
- `npm run lint` ✅ PASS
- `npm run build` ✅ PASS

## Next priorities
1. Add auth/authorization for admin and pharmacy dashboards.
2. Harden reservation counter updates under concurrency (transactional/correct locking strategy).
3. Implement confirmation-page UI that displays generated reservation number and status.
4. Implement remaining workflow UX for claim/reservation statuses (filters, badges, history/event log).

## Reservation fee policy update (Phase 2)
- Persisted in `Reservation` model:
  - `reservationFeeCents` default: 500
  - `reservationFeeStatus` default: "waived"
- Reservation submissions now automatically persist these defaults (no payment processing added).
- Consumer-facing confirmation messaging:
  - “Reservation fee: $5 refundable deposit”
  - Fee is not currently charged; payment activation deferred
  - Refund/forfeit policy preview and prescription/OTC messaging (no prescription upload storage yet)
- Payment processing / Stripe / refunds are deferred for later.


