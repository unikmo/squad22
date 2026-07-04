-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "npi" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profileStatus" TEXT NOT NULL DEFAULT 'unclaimed',
    "pricingPublished" BOOLEAN NOT NULL DEFAULT false,
    "reservationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PharmacyClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unclaimed',
    "submittedPayload" JSONB NOT NULL,
    CONSTRAINT "PharmacyClaim_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pharmacyNpi" TEXT NOT NULL,
    "reservationInput" JSONB NOT NULL,
    "priceResult" JSONB NOT NULL,
    CONSTRAINT "Reservation_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservationCounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yyMMdd" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_npi_key" ON "Pharmacy"("npi");

-- CreateIndex
CREATE INDEX "Pharmacy_state_idx" ON "Pharmacy"("state");

-- CreateIndex
CREATE INDEX "PharmacyClaim_pharmacyNpi_idx" ON "PharmacyClaim"("pharmacyNpi");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationCounter_yyMMdd_key" ON "ReservationCounter"("yyMMdd");
