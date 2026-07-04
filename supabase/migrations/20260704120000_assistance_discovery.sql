ALTER TABLE "Pharmacy"
ADD COLUMN "assistanceSupportEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "manufacturerAssistanceHelp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "foundationAssistanceHelp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publicProgramHelp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "localAssistanceHelp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "assistanceContactName" TEXT,
ADD COLUMN "assistanceContactPhone" TEXT,
ADD COLUMN "assistanceContactEmail" TEXT,
ADD COLUMN "assistanceNotes" TEXT;

ALTER TABLE "Reservation"
ADD COLUMN "assistanceRequested" BOOLEAN NOT NULL DEFAULT false;
