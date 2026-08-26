-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "span" TEXT NOT NULL,
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "ServiceTranslation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PhaseTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "outputs" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "PhaseTranslation_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SectorTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectorId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    CONSTRAINT "SectorTranslation_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FaqTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "faqId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    CONSTRAINT "FaqTranslation_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "prefix" TEXT,
    "suffix" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StatTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    CONSTRAINT "StatTranslation_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'company',
    "name" TEXT NOT NULL,
    "short" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phones" TEXT NOT NULL DEFAULT '[]',
    "addressStreet" TEXT NOT NULL,
    "addressDistrict" TEXT NOT NULL,
    "addressLocality" TEXT NOT NULL,
    "addressRegion" TEXT NOT NULL,
    "addressCountry" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Service_key_key" ON "Service"("key");

-- CreateIndex
CREATE INDEX "Service_order_idx" ON "Service"("order");

-- CreateIndex
CREATE INDEX "ServiceTranslation_locale_idx" ON "ServiceTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTranslation_serviceId_locale_key" ON "ServiceTranslation"("serviceId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_key_key" ON "Phase"("key");

-- CreateIndex
CREATE INDEX "Phase_order_idx" ON "Phase"("order");

-- CreateIndex
CREATE INDEX "PhaseTranslation_locale_idx" ON "PhaseTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseTranslation_phaseId_locale_key" ON "PhaseTranslation"("phaseId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_key_key" ON "Sector"("key");

-- CreateIndex
CREATE INDEX "Sector_order_idx" ON "Sector"("order");

-- CreateIndex
CREATE INDEX "SectorTranslation_locale_idx" ON "SectorTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "SectorTranslation_sectorId_locale_key" ON "SectorTranslation"("sectorId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_key_key" ON "Faq"("key");

-- CreateIndex
CREATE INDEX "Faq_order_idx" ON "Faq"("order");

-- CreateIndex
CREATE INDEX "FaqTranslation_locale_idx" ON "FaqTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "FaqTranslation_faqId_locale_key" ON "FaqTranslation"("faqId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_key_key" ON "Stat"("key");

-- CreateIndex
CREATE INDEX "Stat_order_idx" ON "Stat"("order");

-- CreateIndex
CREATE INDEX "StatTranslation_locale_idx" ON "StatTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "StatTranslation_statId_locale_key" ON "StatTranslation"("statId", "locale");
