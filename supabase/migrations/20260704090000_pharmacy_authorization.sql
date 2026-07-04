ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'PATIENT';

CREATE TABLE "PharmacyMember" (
    "id" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PharmacyMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PharmacyMember_pharmacyNpi_email_key" ON "PharmacyMember"("pharmacyNpi", "email");
CREATE INDEX "PharmacyMember_userId_idx" ON "PharmacyMember"("userId");
CREATE INDEX "PharmacyMember_email_idx" ON "PharmacyMember"("email");
ALTER TABLE "PharmacyMember" ADD CONSTRAINT "PharmacyMember_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy"("npi") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PharmacyMember" ADD CONSTRAINT "PharmacyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
