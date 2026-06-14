import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Reservation seeds are no-op at MVP time; counter row creation is handled here.
// (We do not load CSV inputs for reservations in MVP.)

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// Optional: no-op seed for reservation-related tables at MVP time.
// Real persistence will be handled by route handlers when users submit reservations.
async function main() {
  // Ensure counter row exists for today to reduce first-use friction.
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyMMdd = `${yy}${mm}${dd}`;

  await prisma.reservationCounter.upsert({
    where: { yyMMdd },
    update: {},
    create: { id: yyMMdd, yyMMdd, nextNumber: 1 },
  });

  // If you later add a CSV input for reservation submissions, place it here.
  console.log("Reservation seed ensured counter for today:", yyMMdd);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

