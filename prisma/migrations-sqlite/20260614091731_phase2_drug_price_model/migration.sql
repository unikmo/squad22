-- CreateTable
CREATE TABLE "DrugPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pharmacyId" TEXT NOT NULL,
    "pharmacyNpi" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cashPriceCents" INTEGER NOT NULL,
    "ndc" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DrugPrice_pharmacyNpi_fkey" FOREIGN KEY ("pharmacyNpi") REFERENCES "Pharmacy" ("npi") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
