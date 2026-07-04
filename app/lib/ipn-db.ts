import 'dotenv/config';

import { PrismaClient } from '@prisma/client';





import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient | undefined;

function getPrisma() {
  if (prisma) return prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL');
  const adapter = new PrismaPg({ connectionString });

  prisma = new PrismaClient({
    adapter,
  });

  return prisma;
}

// Avoid TS export-shape issues by using the runtime PrismaClient import type.
export const db = getPrisma();


