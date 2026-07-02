# IPNUS

IPNUS helps patients compare published cash prescription prices from participating independent pharmacies and reserve directly with local pharmacies.

## Stack

- Next.js
- React
- Prisma
- SQLite
- Tailwind CSS

## Local setup

```bash
npm install
npm run dev
```

## Database

Set `DATABASE_URL` in `.env`:

```dotenv
DATABASE_URL="file:./dev.db"
```

Run Prisma setup:

```bash
npx prisma generate
npx prisma migrate dev
```

## Seed data

```bash
npm run seed:pharmacies
```

## NPI/NPPES data policy

Do not commit raw NPPES/NPI CSV files. Large datasets such as `npidata.csv` must stay local and ignored by Git.

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
npm run smoke:ipn
npm run import:nppes
npm run import:nppes:summary
npm run import:nppes:retail-outreach
```

## Current MVP routes

- `/`
- `/search`
- `/results`
- `/reserve`
- `/claim`
- `/pricing`
- `/how-it-works`
- `/faq`
- `/contact`

## Known limitations

- ZIP distance filtering is not yet implemented.
- Reservation requests require pharmacy confirmation.
- Prices are published by participating pharmacies and may change.
