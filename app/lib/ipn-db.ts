import 'dotenv/config';

import { PrismaClient } from '@prisma/client';





import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

let prisma: PrismaClient | undefined;

function getPrisma() {
  if (prisma) return prisma;

  const adapter = new PrismaBetterSqlite3({
    // For Prisma CLI + route handlers, DATABASE_URL must exist.
    // In local dev we fall back to file:./dev.db.
    url: process.env.DATABASE_URL ?? 'file:./dev.db',

  });

  prisma = new PrismaClient({
    adapter,
  });

  return prisma;
}

// Avoid TS export-shape issues by using the runtime PrismaClient import type.
export const db = getPrisma();


