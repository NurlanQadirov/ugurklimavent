import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 takes the connection through a driver adapter rather than reading
 * `url` out of the schema, so the URL is resolved here at runtime.
 *
 * The client is cached on `globalThis` because `next dev` re-evaluates modules
 * on every hot reload; without the cache each edit would open another SQLite
 * connection and the process would eventually run out of file handles.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy `.env.example` to `.env` before starting the app.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
