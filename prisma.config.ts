// Prisma CLI v7 config file (repo-root)
// Prisma migrate/dev + db seed rely on this file in this environment.

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  // Keep the error obvious when running prisma commands.
  throw new Error('Missing DATABASE_URL env var');
}

const prismaConfig = {
  datasource: {
    url: DATABASE_URL,
  },
  migrations: {
    seed: './prisma/seed/index.ts',
  },
};

export default prismaConfig;


