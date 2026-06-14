-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reservationFeeCents" INTEGER NOT NULL DEFAULT 500,
    "reservationFeeStatus" TEXT NOT NULL DEFAULT 'waived',
    "pharmacyNpi" TEXT NOT NULL,
    "reservationInput" JSONB NOT NULL,
    "priceResult" JSONB NOT NULL,
    CONSTRAINT "Reservation_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("createdAt", "id", "pharmacyNpi", "priceResult", "reservationInput", "reservationNumber", "status") SELECT "createdAt", "id", "pharmacyNpi", "priceResult", "reservationInput", "reservationNumber", "status" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
