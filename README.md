# IPNUS

IPNUS helps patients compare published cash prescription prices from participating independent pharmacies and reserve directly with local pharmacies.

## Stack

- Next.js
- React
- Prisma
- PostgreSQL (Supabase)
- Tailwind CSS

## Local setup

```bash
npm install
npm run dev
```

## Database

Set `DATABASE_URL` in `.env`:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres"
AUTH_SECRET="replace-with-a-long-random-secret"
RESEND_API_KEY="re_replace_me"
AUTH_EMAIL_FROM="IPNUS <signin@your-verified-domain.com>"
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

## Authentication and IP Rewards

Patient accounts use passwordless email links through Auth.js and Resend. Configure a verified sending domain and the environment variables above before testing sign-in.

Eligible purchases earn 1 IP Point per dollar after the pharmacy confirms the final purchase total. Every 100 points provides $1 in redemption value at participating IPNUS pharmacies. Rewards are stored in an auditable transaction ledger.

Pharmacy CSV price uploads require `drugName`, `strength`, `quantity`, `cashPrice`, and `productType`. Use `prescription` or `otc` for `productType`.

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
