-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
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
    "outreachLastSentAt" TIMESTAMP(3),
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
    "rewardsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "usedClaimId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ClaimInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyClaim" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unclaimed',
    "submittedPayload" JSONB NOT NULL,

    CONSTRAINT "PharmacyClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "reservationNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reservationFeeCents" INTEGER NOT NULL DEFAULT 500,
    "reservationFeeStatus" TEXT NOT NULL DEFAULT 'waived',
    "fulfillmentMethod" TEXT NOT NULL DEFAULT 'pickup',
    "deliveryAddress" JSONB,
    "deliveryFeeCents" INTEGER,
    "rewardRateBps" INTEGER NOT NULL DEFAULT 100,
    "rewardPointsEstimated" INTEGER NOT NULL DEFAULT 0,
    "rewardStatus" TEXT NOT NULL DEFAULT 'pending',
    "actualPurchaseCents" INTEGER,
    "completedAt" TIMESTAMP(3),
    "patientId" TEXT,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "rewardDiscountCents" INTEGER NOT NULL DEFAULT 0,
    "prescriptionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "pharmacyNpi" TEXT NOT NULL,
    "reservationInput" JSONB NOT NULL,
    "priceResult" JSONB NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RewardTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "eligibleSpendCents" INTEGER,
    "fundingCents" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationCounter" (
    "id" TEXT NOT NULL,
    "yyMMdd" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugPrice" (
    "id" TEXT NOT NULL,
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
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorReferral" (
    "id" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedPatientSavingsCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_npi_key" ON "Pharmacy"("npi");

-- CreateIndex
CREATE INDEX "Pharmacy_state_idx" ON "Pharmacy"("state");

-- CreateIndex
CREATE INDEX "Pharmacy_outreachStatus_idx" ON "Pharmacy"("outreachStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimInvite_token_key" ON "ClaimInvite"("token");

-- CreateIndex
CREATE INDEX "ClaimInvite_pharmacyNpi_idx" ON "ClaimInvite"("pharmacyNpi");

-- CreateIndex
CREATE INDEX "ClaimInvite_status_idx" ON "ClaimInvite"("status");

-- CreateIndex
CREATE INDEX "ClaimInvite_createdAt_idx" ON "ClaimInvite"("createdAt");

-- CreateIndex
CREATE INDEX "PharmacyClaim_pharmacyNpi_idx" ON "PharmacyClaim"("pharmacyNpi");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reservationNumber_key" ON "Reservation"("reservationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "RewardTransaction_userId_createdAt_idx" ON "RewardTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RewardTransaction_pharmacyNpi_createdAt_idx" ON "RewardTransaction"("pharmacyNpi", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardTransaction_reservationId_type_key" ON "RewardTransaction"("reservationId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationCounter_yyMMdd_key" ON "ReservationCounter"("yyMMdd");

-- CreateIndex
CREATE INDEX "DrugPrice_pharmacyNpi_idx" ON "DrugPrice"("pharmacyNpi");

-- CreateIndex
CREATE INDEX "DrugPrice_drugName_idx" ON "DrugPrice"("drugName");

-- CreateIndex
CREATE INDEX "DrugPrice_strength_idx" ON "DrugPrice"("strength");

-- CreateIndex
CREATE INDEX "DrugPrice_quantity_idx" ON "DrugPrice"("quantity");

-- CreateIndex
CREATE INDEX "DrugPrice_status_idx" ON "DrugPrice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DrugPrice_pharmacyNpi_drugName_strength_quantity_status_key" ON "DrugPrice"("pharmacyNpi", "drugName", "strength", "quantity", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorReferral_referralCode_key" ON "DoctorReferral"("referralCode");

-- AddForeignKey
ALTER TABLE "ClaimInvite" ADD CONSTRAINT "ClaimInvite_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyClaim" ADD CONSTRAINT "PharmacyClaim_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardTransaction" ADD CONSTRAINT "RewardTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardTransaction" ADD CONSTRAINT "RewardTransaction_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardTransaction" ADD CONSTRAINT "RewardTransaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugPrice" ADD CONSTRAINT "DrugPrice_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE RESTRICT ON UPDATE CASCADE;
