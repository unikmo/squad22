# TODO - UX cleanup remaining work

## Step 1: Update files
- [x] app/page.tsx: embed search card in homepage hero, remove CTA, add How it works section
- [x] app/results/page.tsx: quick UX cleanup (cash price prominence, pharmacy label, reserve button prominent, pickup/delivery availability placeholder)
- [ ] app/reserve/page.tsx: streamlined buyer flow, sign-in gate, remove visible first/last/phone/email inputs, rewards math via Math.floor(reservePrice), remove “Marks rx…” copy, pickup/delivery UI changes (keep hidden/demo values only if API requires)
- [ ] app/reservation/confirmation/page.tsx: reservation number, pending points estimate (or generic), prescription verification message, remove policy/mock-data wording

## Step 2: Validate
- [ ] npx tsc -p tsconfig.json --noEmit --pretty false
- [ ] npx eslint --max-warnings=0
- [ ] npm run build

