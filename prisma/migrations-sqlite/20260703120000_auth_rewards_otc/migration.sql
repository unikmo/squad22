CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" DATETIME,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "Pharmacy" ADD COLUMN "rewardsEnabled" BOOLEAN NOT NULL DEFAULT true;
UPDATE "Pharmacy" SET "rewardsEnabled" = true WHERE "reservationsEnabled" = true;

ALTER TABLE "Reservation" ADD COLUMN "actualPurchaseCents" INTEGER;
ALTER TABLE "Reservation" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Reservation" ADD COLUMN "patientId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD COLUMN "pointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Reservation" ADD COLUMN "rewardDiscountCents" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" DATETIME NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE "RewardTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "pharmacyNpi" TEXT NOT NULL,
  "reservationId" TEXT,
  "type" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "eligibleSpendCents" INTEGER,
  "fundingCents" INTEGER,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RewardTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RewardTransaction_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RewardTransaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "RewardTransaction_reservationId_type_key" ON "RewardTransaction"("reservationId", "type");
CREATE INDEX "RewardTransaction_userId_createdAt_idx" ON "RewardTransaction"("userId", "createdAt");
CREATE INDEX "RewardTransaction_pharmacyNpi_createdAt_idx" ON "RewardTransaction"("pharmacyNpi", "createdAt");
