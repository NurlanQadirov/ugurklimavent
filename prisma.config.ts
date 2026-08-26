import path from "node:path";

import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 no longer auto-loads `.env`, hence the explicit `dotenv/config`
 * import above — without it `env("DATABASE_URL")` throws before the CLI starts.
 *
 * Prisma 7 also moved the connection URL out of `schema.prisma`. The schema now
 * declares only the provider; the URL lives here for the CLI (migrate, studio,
 * seed) and is passed to `PrismaClient` through a driver adapter at runtime —
 * see `lib/db.ts`.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
});
