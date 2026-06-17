# TODO
- [x] Update `app/pharmacy-dashboard/[npi]/page.tsx` to add missing MVP operational workflow alignment UI:
  - [x] Pharmacy dashboard operational summary (name/NPI, profile/pricing/reservation statuses)
  - [x] Founding partner + freeTrialMonths visibility
  - [x] Local delivery settings summary + max 20 miles rule display
  - [x] Price management section: CSV upload + manual repricing entry point (single engine)
  - [x] Reservation management table: detailed fields + keep existing reservation status action buttons unchanged
  - [x] Prescription review queue section placeholder for `required_pending_verification`
  - [x] Branding: ensure IPNUS everywhere on pharmacy-facing pages
  - [x] Remove any MVP/mock-data wording from pharmacy-facing pages (only if present)


- [ ] Run checks:
  - [ ] `npx tsc -p tsconfig.json --noEmit --pretty false`
  - [ ] `npx eslint --max-warnings=0`
  - [ ] `npm run build`

