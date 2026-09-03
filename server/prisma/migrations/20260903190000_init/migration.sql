CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Pet" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "breed" TEXT,
  "birthdate" TIMESTAMP(3),
  "weight" DOUBLE PRECISION,
  "photoUrl" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Pet_ownerId_idx" ON "Pet"("ownerId");

CREATE TABLE "WellnessEntry" (
  "id" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "weight" DOUBLE PRECISION,
  "activityMinutes" INTEGER,
  "mood" TEXT,
  "notes" TEXT,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WellnessEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WellnessEntry_petId_recordedAt_idx" ON "WellnessEntry"("petId", "recordedAt");

CREATE TABLE "Vaccination" (
  "id" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "administeredAt" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Vaccination_petId_dueDate_idx" ON "Vaccination"("petId", "dueDate");

CREATE TABLE "VetVisit" (
  "id" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "visitDate" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VetVisit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VetVisit_petId_visitDate_idx" ON "VetVisit"("petId", "visitDate");

ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WellnessEntry" ADD CONSTRAINT "WellnessEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VetVisit" ADD CONSTRAINT "VetVisit_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
