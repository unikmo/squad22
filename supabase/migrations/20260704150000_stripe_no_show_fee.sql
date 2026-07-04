ALTER TABLE "Reservation"
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "stripePaymentStatus" TEXT,
ADD COLUMN "stripeAuthorizedAt" TIMESTAMP(3),
ADD COLUMN "stripeCapturedAt" TIMESTAMP(3),
ADD COLUMN "stripeCanceledAt" TIMESTAMP(3),
ADD COLUMN "noShowEligibleAt" TIMESTAMP(3),
ADD COLUMN "paymentFailureReason" TEXT;

CREATE UNIQUE INDEX "Reservation_stripePaymentIntentId_key" ON "Reservation"("stripePaymentIntentId");
