/**
 * Backs up everything the admin panel owns and git does not: the SQLite
 * database and the icons uploaded through the panel.
 *
 * Both are gitignored by design — that is what keeps `git pull` from ever
 * touching them — but it also means a redeploy, a disk failure or a mistyped
 * `rm` has nothing to restore from unless something like this runs on a timer.
 *
 * The database is copied with SQLite's own `VACUUM INTO`, not `cp`: it takes a
 * consistent snapshot while the site is serving traffic, whereas copying the
 * file mid-write can produce a corrupt backup.
 *
 * Run:   npm run backup
 * Cron:  0 3 * * *  cd /srv/apps/ugurklimavent && /usr/bin/node scripts/backup.mjs >> /var/log/ugurklimavent-backup.log 2>&1
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import "dotenv/config";
import Database from "better-sqlite3";

const run = promisify(execFile);

const ROOT = process.cwd();

/**
 * The file is wherever `DATABASE_URL` points, not a hardcoded name: the local
 * checkout calls it `dev.db` and a server is free to call it something else,
 * and a backup that guessed wrong would silently snapshot nothing.
 */
function databaseFile() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — nothing to back up.");
  }
  if (!url.startsWith("file:")) {
    throw new Error(`DATABASE_URL is not a SQLite file URL: ${url}`);
  }
  return path.resolve(ROOT, url.slice("file:".length));
}

const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

/** Keep backups off the deploy directory so a wipe of it loses nothing. */
const BACKUP_DIR =
  process.env.BACKUP_DIR ?? path.join(ROOT, "..", "ugurklimavent-backups");

/** How many daily snapshots to keep before the oldest is dropped. */
const KEEP = Number(process.env.BACKUP_KEEP ?? 14);

const PREFIX = "ugurklimavent-";

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function backupDatabase(target) {
  const file = databaseFile();
  if (!existsSync(file)) {
    throw new Error(`Database not found at ${file}`);
  }

  // Read-only handle: a backup must never be able to modify the live data.
  const db = new Database(file, { readonly: true });
  try {
    // VACUUM INTO is atomic and safe against concurrent writers, unlike `cp`.
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  } finally {
    db.close();
  }

  const { size } = await stat(target);
  console.log(`✓ database  → ${path.basename(target)} (${mb(size)})`);
}

async function backupUploads(target) {
  if (!existsSync(UPLOADS_DIR)) {
    console.log("· uploads   → directory does not exist yet, skipped");
    return;
  }

  const entries = await readdir(UPLOADS_DIR, { recursive: true });
  const files = entries.filter((name) => !name.endsWith(".gitkeep"));
  if (files.length === 0) {
    console.log("· uploads   → empty, skipped");
    return;
  }

  await run("tar", ["-czf", target, "-C", path.join(ROOT, "public"), "uploads"]);
  const { size } = await stat(target);
  console.log(`✓ uploads   → ${path.basename(target)} (${mb(size)})`);
}

/**
 * Rotation counts *database* snapshots and removes everything sharing the
 * timestamp of the ones that fall off the end, so a run's db and uploads are
 * always deleted together rather than drifting apart.
 */
async function rotate() {
  const files = await readdir(BACKUP_DIR);

  const stamps = files
    .filter((name) => name.startsWith(PREFIX) && name.endsWith(".db"))
    .map((name) => name.slice(PREFIX.length, -".db".length))
    .sort()
    .reverse();

  for (const old of stamps.slice(KEEP)) {
    for (const name of files.filter((f) => f.includes(old))) {
      await rm(path.join(BACKUP_DIR, name), { force: true });
      console.log(`· removed   → ${name}`);
    }
  }
}

async function main() {
  await mkdir(BACKUP_DIR, { recursive: true });
  const id = stamp();

  await backupDatabase(path.join(BACKUP_DIR, `${PREFIX}${id}.db`));
  await backupUploads(path.join(BACKUP_DIR, `uploads-${id}.tar.gz`));
  await rotate();

  console.log(`✓ backup complete → ${path.resolve(BACKUP_DIR)} (keeping ${KEEP})`);
}

main().catch((error) => {
  console.error("✗ backup failed:", error);
  process.exit(1);
});
