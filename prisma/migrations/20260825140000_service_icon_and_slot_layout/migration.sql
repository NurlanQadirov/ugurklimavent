-- Drop `Service.span` and add `Service.iconPath`.
--
-- `span` is deliberately dropped rather than migrated: the card footprint is
-- now derived from `order` against the fixed bento slots in `lib/bento.ts`, so
-- keeping the column would leave a second, contradictable source of truth for
-- something the ordering already decides.
--
-- Written by hand in the redefine-table form Prisma uses for SQLite, so the
-- column order and constraints match exactly what `prisma migrate` would emit.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "iconPath" TEXT,
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Service" ("id", "key", "index", "critical", "order", "createdAt", "updatedAt")
SELECT "id", "key", "index", "critical", "order", "createdAt", "updatedAt" FROM "Service";

DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";

CREATE UNIQUE INDEX "Service_key_key" ON "Service"("key");
CREATE INDEX "Service_order_idx" ON "Service"("order");

PRAGMA foreign_keys=ON;
