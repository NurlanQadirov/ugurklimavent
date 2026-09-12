#!/usr/bin/env bash
#
# Redeploys the site on the VPS without touching anything the admin panel owns.
#
# The rule this script exists to enforce: `npm run db:seed` is a FIRST-INSTALL
# command only. Every seeded row is an upsert keyed on its slug, so re-running
# it on a live site rewrites the services, sectors, phases, FAQs and company
# record back to `i18n/dictionaries/*.json` — copy edited in the panel would
# silently revert. Migrations (`db:deploy`) are the safe path; they add schema
# and never reset rows.
#
# Usage:  ./scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ 1/6  Backing up the database and uploads first"
node scripts/backup.mjs

echo "→ 2/6  Pulling the new code"
git pull --ff-only

echo "→ 3/6  Installing dependencies"
npm ci

echo "→ 4/6  Applying database migrations (data is preserved)"
npm run db:deploy

echo "→ 5/6  Building"
npm run build

echo "→ 6/6  Restarting"
sudo systemctl restart ugurklimavent

echo "✓ Deploy complete. Content, uploads and the admin account are untouched."
