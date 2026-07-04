-- CreateTable
CREATE TABLE "ClaimInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "usedClaimId" TEXT,
    "metadata" JSONB,
    CONSTRAINT "ClaimInvite_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Pharmacy" ("address1", "address2", "city", "createdAt", "id", "name", "npi", "phone", "pricingPublished", "profileStatus", "reservationsEnabled", "state", "updatedAt", "zip") SELECT "address1", "address2", "city", "createdAt", "id", "name", "npi", "phone", "pricingPublished", "profileStatus", "reservationsEnabled", "state", "updatedAt", "zip" FROM "Pharmacy";
DROP TABLE "Pharmacy";
ALTER TABLE "new_Pharmacy" RENAME TO "Pharmacy";
CREATE UNIQUE INDEX "Pharmacy_npi_key" ON "Pharmacy"("npi");
CREATE INDEX "Pharmacy_state_idx" ON "Pharmacy"("state");
CREATE INDEX "Pharmacy_outreachStatus_idx" ON "Pharmacy"("outreachStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ClaimInvite_token_key" ON "ClaimInvite"("token");

-- CreateIndex
CREATE INDEX "ClaimInvite_pharmacyNpi_idx" ON "ClaimInvite"("pharmacyNpi");

-- CreateIndex
CREATE INDEX "ClaimInvite_status_idx" ON "ClaimInvite"("status");

-- CreateIndex
CREATE INDEX "ClaimInvite_createdAt_idx" ON "ClaimInvite"("createdAt");
