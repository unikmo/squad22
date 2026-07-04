import 'dotenv/config';

// Prisma CLI v7 config file (repo-root)
// Prisma migrate/dev + db seed rely on this file in this environment.

const DATABASE_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://localhost/ipnus';

const prismaConfig = {
  datasource: {
    url: DATABASE_URL,
  },
  migrations: {
    seed: './prisma/seed/index.ts',
  },
};

export default prismaConfig;


