/**
 * Sets an administrator's password.
 *
 * The seed only ever *creates* an administrator — it deliberately leaves an
 * existing one alone, so it cannot be used to change a password that is already
 * in the database. This can, and it is the only supported way to rotate one
 * without opening the SQLite file by hand.
 *
 * The password is read from stdin rather than taken as an argument: an argument
 * is visible in `ps` output and lands in the shell history of whoever ran it.
 *
 * Run:  npm run admin:password -- admin@example.com
 *       (then type the new password and press Enter)
 */
import { createInterface } from "node:readline/promises";

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:password -- <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = (await rl.question("New password: ")).trim();
rl.close();

if (password.length < 12) {
  console.error("✗ Too short — use at least 12 characters.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`✗ No administrator with the address ${email}.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    // Cost 12, the same as the seed: high enough that a leaked hash is not
    // worth grinding, low enough that a login still feels instant.
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  console.log(`✓ Password changed for ${email}.`);
} finally {
  await prisma.$disconnect();
}
