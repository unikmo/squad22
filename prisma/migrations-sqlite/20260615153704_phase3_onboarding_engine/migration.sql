-- CreateTable
CREATE TABLE "DoctorReferral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedPatientSavingsCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DrugPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pharmacyId" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cashPriceCents" INTEGER NOT NULL,
    "ndc" TEXT,
    "productType" TEXT NOT NULL DEFAULT 'prescription',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DrugPrice_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DrugPrice" ("cashPriceCents", "createdAt", "drugName", "effectiveDate", "id", "ndc", "pharmacyId", "pharmacyNpi", "quantity", "source", "status", "strength", "updatedAt") SELECT "cashPriceCents", "createdAt", "drugName", "effectiveDate", "id", "ndc", "pharmacyId", "pharmacyNpi", "quantity", "source", "status", "strength", "updatedAt" FROM "DrugPrice";
DROP TABLE "DrugPrice";
ALTER TABLE "new_DrugPrice" RENAME TO "DrugPrice";
CREATE INDEX "DrugPrice_pharmacyNpi_idx" ON "DrugPrice"("pharmacyNpi");
CREATE INDEX "DrugPrice_drugName_idx" ON "DrugPrice"("drugName");
CREATE INDEX "DrugPrice_strength_idx" ON "DrugPrice"("strength");
CREATE INDEX "DrugPrice_quantity_idx" ON "DrugPrice"("quantity");
CREATE INDEX "DrugPrice_status_idx" ON "DrugPrice"("status");
CREATE UNIQUE INDEX "DrugPrice_pharmacyNpi_drugName_strength_quantity_status_key" ON "DrugPrice"("pharmacyNpi", "drugName", "strength", "quantity", "status");
CREATE TABLE "new_Pharmacy" (
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
    "website" TEXT,
    "email" TEXT,
    "preferredContactMethod" TEXT,
    "outreachStatus" TEXT NOT NULL DEFAULT 'not_started',
    "outreachLastSentAt" DATETIME,
    "outreachAttempts" INTEGER NOT NULL DEFAULT 0,
    "enrichmentStatus" TEXT NOT NULL DEFAULT 'missing',
    "enrichmentSource" TEXT,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadiusMiles" INTEGER,
    "deliveryFeeCents" INTEGER,
    "deliveryMinimumOrderCents" INTEGER,
    "freeDeliveryThresholdCents" INTEGER,
    "foundingPartner" BOOLEAN NOT NULL DEFAULT false,
    "freeTrialMonths" INTEGER NOT NULL DEFAULT 6,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Pharmacy" ("address1", "address2", "city", "createdAt", "email", "enrichmentSource", "enrichmentStatus", "id", "name", "npi", "outreachAttempts", "outreachLastSentAt", "outreachStatus", "phone", "preferredContactMethod", "pricingPublished", "profileStatus", "reservationsEnabled", "state", "updatedAt", "website", "zip") SELECT "address1", "address2", "city", "createdAt", "email", "enrichmentSource", "enrichmentStatus", "id", "name", "npi", "outreachAttempts", "outreachLastSentAt", "outreachStatus", "phone", "preferredContactMethod", "pricingPublished", "profileStatus", "reservationsEnabled", "state", "updatedAt", "website", "zip" FROM "Pharmacy";
DROP TABLE "Pharmacy";
ALTER TABLE "new_Pharmacy" RENAME TO "Pharmacy";
CREATE UNIQUE INDEX "Pharmacy_npi_key" ON "Pharmacy"("npi");
CREATE INDEX "Pharmacy_state_idx" ON "Pharmacy"("state");
CREATE INDEX "Pharmacy_outreachStatus_idx" ON "Pharmacy"("outreachStatus");
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reservationFeeCents" INTEGER NOT NULL DEFAULT 500,
    "reservationFeeStatus" TEXT NOT NULL DEFAULT 'waived',
    "fulfillmentMethod" TEXT NOT NULL DEFAULT 'pickup',
    "deliveryAddress" JSONB,
    "deliveryFeeCents" INTEGER,
    "rewardRateBps" INTEGER NOT NULL DEFAULT 100,
    "rewardPointsEstimated" INTEGER NOT NULL DEFAULT 0,
    "rewardStatus" TEXT NOT NULL DEFAULT 'pending',
    "prescriptionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "pharmacyNpi" TEXT NOT NULL,
    "reservationInput" JSONB NOT NULL,
    "priceResult" JSONB NOT NULL,
    CONSTRAINT "Reservation_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("createdAt", "id", "pharmacyNpi", "priceResult", "reservationFeeCents", "reservationFeeStatus", "reservationInput", "reservationNumber", "status") SELECT "createdAt", "id", "pharmacyNpi", "priceResult", "reservationFeeCents", "reservationFeeStatus", "reservationInput", "reservationNumber", "status" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorReferral_referralCode_key" ON "DoctorReferral"("referralCode");
