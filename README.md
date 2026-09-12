# Uğur Klima Vent — site and content admin

Trilingual (az/en/ru) corporate site on Next.js App Router, with a content
administration panel at `/admin`.

## Getting started

```bash
npm install
```

Copy the environment template and fill it in:

```bash
cp .env.example .env
```

`AUTH_SECRET` can be generated with `npx auth secret`. `ADMIN_EMAIL` and
`ADMIN_PASSWORD` are the administrator the seed creates.

Create the database and load the current content into it:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

Then:

```bash
npm run dev
```

The site is at `/az`, `/en`, `/ru`; the admin panel is at `/admin`.

## How content is stored

Content lives in SQLite, through Prisma. It is split the same way it was when
it was hardcoded:

- **Structure** — index labels, ordering, icon — is one row per item.
- **Copy** — titles, descriptions, tags — is one row per item *per language*.

That split is what stops a translator editing Russian copy from reflowing the
bento grid, and it is why the admin forms show `Az / En / Ru` tabs over the copy
fields but not over the structural ones.

The dictionaries in `i18n/dictionaries/*.json` are still the source for
everything the panel does not manage — page metadata, navigation, the hero,
section headings and the accessibility strings — and `en.json` is still the
schema TypeScript checks the other two against.

### How it reaches the page

`getSiteDictionary(locale)` merges the translated JSON with the database content
and hands the result to the existing `DictionaryProvider`. Section components
call `getServices(dict)` exactly as before and are unaware of the change.

`Service.id` and its siblings carry the **slug**, not the database key, because
the slug is what picks the card icon and what the `aria-labelledby` ids are
built from.

### Caching

The public routes prerender through `generateStaticParams`, so the queries run
at build time and visitors are served static pages. Every admin mutation calls
`revalidatePath("/[lang]", "layout")`, which regenerates them.

## Admin panel

`/admin` is a second root layout, separate from the site. None of the site's
providers, smooth scrolling or backdrop layers are mounted there.

- `/admin/login` is outside the auth guard; everything in `app/admin/(panel)/`
  is behind it.
- Server Actions re-check the session and re-validate their input with the same
  Zod schema the form used, because an action is reachable by a direct POST and
  not only through the UI.

The panel's own interface is in Azerbaijani. The strings are inline in the
admin components, so any wording can be changed by searching for it.

### Service layout and icons

The expertise grid is a fixed set of slots defined in `lib/bento.ts`, and a
service takes the slot matching its **position**. Move a service up and it
inherits the footprint of the slot it moves into; the one it displaced takes the
slot below. The grid therefore always tiles to six columns, whatever the order.

There is no per-service span to edit. The admin list shows the resulting size in
words (Böyük kart, Geniş kart, Dar kart, Tam en) so the effect of a reorder is
visible before making it. Past the seventh slot, extra services fall back to
narrow cards, which also tile.

Icons can be uploaded per service (SVG, PNG, JPG or WEBP, up to 512 KB). They
land in `public/uploads/services/` and are referenced by path. A service with no
upload falls back to the built-in glyph matching its **key**, and a key with no
matching glyph renders no icon at all — the card layout does not depend on one.

Uploaded SVGs are stripped of `<script>`, event handlers and `javascript:` URLs
on the way in, rendered through `<img>` so script cannot execute, and served
with a `sandbox` CSP from `next.config.ts`.

### Editing caveats

- Uploads live on disk next to the SQLite file. Both assume a deployment with a
  persistent filesystem; a platform with an ephemeral one would lose them on
  redeploy and would need object storage instead.
- Choosing an icon uploads it immediately, so abandoning the dialog can leave an
  unreferenced file in `public/uploads/services/`. Harmless, but it accumulates.
- An item saved without copy for a language is **hidden** from that language's
  pages rather than shown blank. The dashboard lists any such gaps.

## Deploying to the VPS

The box runs the app as a systemd unit behind Nginx, one Node process per site.
Config for both lives in `deploy/` and is copied into place, so the deployed
configuration is reviewable here rather than only on the server.

### First install (once)

```bash
sudo -u deploy git clone https://github.com/NurlanQadirov/ugurklimavent.git /srv/apps/ugurklimavent
cd /srv/apps/ugurklimavent
npm ci
cp .env.example .env      # fill in AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:deploy         # creates the SQLite file and applies the schema
npm run db:seed           # ONE TIME ONLY — see the warning below
npm run build
sudo cp deploy/ugurklimavent.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now ugurklimavent
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ugurklimavent
sudo ln -sf /etc/nginx/sites-available/ugurklimavent /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Every redeploy after that

```bash
./scripts/deploy.sh
```

which is: backup → `git pull` → `npm ci` → `npm run db:deploy` → `npm run
build` → `systemctl restart`. **No `db:seed`.**

> ### ⚠️ `npm run db:seed` is a first-install command only
>
> Every seeded row is an upsert keyed on its slug, which makes the seed safe to
> re-run against the rows *it* created — and that is exactly the problem on a
> live site. Re-running it rewrites the services, sectors, phases, FAQs and the
> company record back to `i18n/dictionaries/*.json`, so copy edited in the panel
> silently reverts. Items **created** in the panel have no slug in the
> dictionaries and are never touched, and an administrator that already exists
> keeps the password they changed to. Migrations (`npm run db:deploy`) are the
> safe path for every deploy after the first — they add schema, never rows.

### What survives a redeploy

Everything the panel writes lives in two gitignored places, so `git pull` and
`npm run build` cannot reach it:

- the SQLite file `DATABASE_URL` points at — content, settings, the admin account
- `public/uploads/` — icons uploaded through the panel

This holds only if you deploy with **`git pull`**. A fresh clone over the top,
an unzipped copy or `rsync --delete` erases both. If you must rsync, exclude
them:

```bash
rsync -av --delete --exclude 'prisma/*.db*' --exclude 'public/uploads' --exclude '.env' --exclude '.next' --exclude 'node_modules' ./ deploy@vps:/srv/apps/ugurklimavent/
```

### Backups

`npm run backup` snapshots both into `../ugurklimavent-backups/` — deliberately
outside the deploy directory, so wiping that directory loses nothing. The
database is copied with SQLite's `VACUUM INTO` rather than `cp`, which is what
makes a snapshot taken while the site is serving traffic consistent instead of
possibly corrupt. Fourteen snapshots are kept (`BACKUP_KEEP` to change,
`BACKUP_DIR` to relocate). `scripts/deploy.sh` runs it before touching
anything; a nightly one is worth adding too:

```cron
0 3 * * * cd /srv/apps/ugurklimavent && /usr/bin/node scripts/backup.mjs >> /var/log/ugurklimavent-backup.log 2>&1
```

To restore: stop the unit, copy a snapshot over the database file, untar the
matching `uploads-*.tar.gz` into `public/`, start the unit.

### Notes

- **Run exactly one Node process.** SQLite takes a single writer; a clustered
  setup handing several processes the same file is the one thing to avoid.
- `postinstall` runs `prisma generate` automatically.
- `better-sqlite3` is native. If Node's major version on the box ever changes,
  run `npm rebuild better-sqlite3`.
- The `/uploads` headers in `deploy/nginx.conf` duplicate the ones in
  `next.config.ts` on purpose — Nginx serves those files directly, so Next is
  no longer in the request path to set them. Change one, change the other.
- `.env` is gitignored and must be created on the server by hand. `AUTH_SECRET`
  must be set or NextAuth refuses to start; keep `AUTH_TRUST_HOST=true` and
  leave `AUTH_URL` unset so redirects follow the real host.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:seed` | Load content from the dictionaries — **first install only**, see the deploy section |
| `npm run db:studio` | Browse the database |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:deploy` | Apply pending migrations (production; never seeds) |
| `npm run backup` | Snapshot the database and uploads into `../ugurklimavent-backups/` |
| `npm run typecheck` | `tsc --noEmit` |
| `./scripts/deploy.sh` | Full safe redeploy: backup → pull → install → migrate → build → restart |

Re-running the seed refreshes the originally seeded rows and leaves anything
added since alone. It never resets the password of an existing administrator.

## Notes

- Prisma 7 keeps the connection URL in `prisma.config.ts`, not in the schema,
  and connects through a driver adapter — see `lib/db.ts`.
- Next 16 renamed Middleware to Proxy; the locale negotiation is in `proxy.ts`,
  which explicitly skips `/admin`.
- The site and the admin panel use different `cn` helpers on purpose:
  `lib/utils.ts` for the site (plain join), `lib/ui.ts` for the panel
  (`clsx` + `tailwind-merge`).
