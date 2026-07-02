# TODO

- [x] Update homepage UX hierarchy (app/page.tsx)
  - [x] Remove above-the-fold clutter
  - [x] Replace headline/subtext/trust line
  - [x] Add visual emoji anchor
  - [x] Pass showLocationButton={false} to SearchFormClient
- [x] Update shared search card UX (app/search/search-form-client.tsx)
  - [x] Add showLocationButton prop (default true)
  - [x] Make card compact and focused
  - [x] Primary fields: Medication + ZIP
  - [x] Strength + Quantity in optional/advanced section
  - [x] Hide geolocation UX when showLocationButton=false
- [ ] Run validations (PowerShell)
  - [ ] npx tsc -p tsconfig.json --noEmit --pretty false
  - [ ] npx eslint --max-warnings=0
  - [ ] npm run build


