import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import az from "../i18n/dictionaries/az.json";
import en from "../i18n/dictionaries/en.json";
import ru from "../i18n/dictionaries/ru.json";

/**
 * Migrates the content that used to live in `lib/content.ts` and the three
 * dictionaries into the database, verbatim.
 *
 * The dictionaries stay in the repo and remain the source for everything the
 * admin panel does *not* manage (meta, nav, hero, manifesto, capabilities,
 * section headings, a11y strings). This script only lifts out the five managed
 * collections plus the company record.
 *
 * Every write is an upsert keyed on the stable slug, so re-running the seed on
 * a populated database refreshes the original rows without duplicating them and
 * without touching anything the client has since added.
 */

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

const DICTS = { az, en, ru } as const;
type Loc = keyof typeof DICTS;
const LOCALES = Object.keys(DICTS) as Loc[];

/* Structure — lifted from the `*_LAYOUT` arrays in the old `lib/content.ts`. */

/**
 * Order is what decides each card's footprint now — position N takes bento slot
 * N from `lib/bento.ts` — so this array reproduces the original grid purely by
 * keeping the services in their original sequence.
 *
 * The `index` values are written for completeness only. The site derives the
 * card number from render position (see `lib/site-content.ts`) precisely
 * because these two used to disagree here: `fire` was seeded third by number
 * but second by position, and the grid counted 01, 03, 02 in the DOM. They are
 * kept in step now so the seeded rows do not read as contradictory, but
 * nothing public depends on them.
 */
const SERVICES = [
  { key: "ventilation", index: "01", critical: false },
  { key: "fire", index: "02", critical: true },
  { key: "cooling", index: "03", critical: false },
  { key: "heating", index: "04", critical: false },
  { key: "chillers", index: "05", critical: false },
  { key: "kitchens", index: "06", critical: false },
  { key: "infrastructure", index: "07", critical: false },
] as const;

const PHASES = [
  { key: "survey", index: "01" },
  { key: "design", index: "02" },
  { key: "supply", index: "03" },
  { key: "install", index: "04" },
  { key: "commission", index: "05" },
] as const;

const SECTORS = [
  "industrial",
  "retail",
  "hospitality",
  "kitchens",
  "offices",
  "residential",
] as const;

/**
 * The questions run in the order a real first call goes. That ordering decides
 * which item leads the `FAQPage` node, so it is preserved exactly.
 */
const FAQS = [
  "scope",
  "licence",
  "duration",
  "documents",
  "pricing",
  "coverage",
  "emergency",
  "existing",
] as const;

const STATS = [
  { key: "disciplines", value: SERVICES.length, prefix: null, suffix: null },
  { key: "response", value: 24, prefix: null, suffix: "/7" },
  { key: "years", value: 12, prefix: null, suffix: "+" },
  { key: "systems", value: 240, prefix: null, suffix: "+" },
] as const;

const COMPANY = {
  id: "company",
  name: "Uğur Klima Vent MMC",
  short: "Uğur Klima Vent",
  email: "a.mamedov78@gmail.com",
  phones: JSON.stringify(["+994 50 203 80 13", "+994 70 203 80 13"]),
  addressStreet: "Alatava 2",
  addressDistrict: "Nasimi",
  addressLocality: "Baku",
  addressRegion: "Baku",
  addressCountry: "AZ",
};

async function main() {
  /* ---------------------------------------------------------------- admin */

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in `.env`.");
  }

  await prisma.user.upsert({
    where: { email },
    // An existing administrator keeps the password they have already changed
    // to — re-seeding must never silently reset it back to the `.env` value.
    update: {},
    create: {
      email,
      name: "Administrator",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  /* -------------------------------------------------------------- company */

  const { id, ...companyFields } = COMPANY;
  await prisma.companySettings.upsert({
    where: { id },
    update: companyFields,
    create: COMPANY,
  });

  /* ------------------------------------------------------------- services */

  for (const [order, service] of SERVICES.entries()) {
    const { key, ...structure } = service;
    const row = await prisma.service.upsert({
      where: { key },
      update: { ...structure, order },
      create: { key, ...structure, order },
    });

    for (const locale of LOCALES) {
      const copy = DICTS[locale].expertise.services[key];
      const data = {
        title: copy.title,
        blurb: copy.blurb,
        tags: JSON.stringify(copy.tags),
      };
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: row.id, locale } },
        update: data,
        create: { serviceId: row.id, locale, ...data },
      });
    }
  }

  /* --------------------------------------------------------------- phases */

  for (const [order, phase] of PHASES.entries()) {
    const row = await prisma.phase.upsert({
      where: { key: phase.key },
      update: { index: phase.index, order },
      create: { key: phase.key, index: phase.index, order },
    });

    for (const locale of LOCALES) {
      const copy = DICTS[locale].process.phases[phase.key];
      const data = {
        title: copy.title,
        blurb: copy.blurb,
        outputs: JSON.stringify(copy.outputs),
      };
      await prisma.phaseTranslation.upsert({
        where: { phaseId_locale: { phaseId: row.id, locale } },
        update: data,
        create: { phaseId: row.id, locale, ...data },
      });
    }
  }

  /* -------------------------------------------------------------- sectors */

  for (const [order, key] of SECTORS.entries()) {
    const row = await prisma.sector.upsert({
      where: { key },
      update: { order },
      create: { key, order },
    });

    for (const locale of LOCALES) {
      const copy = DICTS[locale].sectors.items[key];
      const data = { name: copy.name, detail: copy.detail };
      await prisma.sectorTranslation.upsert({
        where: { sectorId_locale: { sectorId: row.id, locale } },
        update: data,
        create: { sectorId: row.id, locale, ...data },
      });
    }
  }

  /* ------------------------------------------------------------------ faq */

  for (const [order, key] of FAQS.entries()) {
    const row = await prisma.faq.upsert({
      where: { key },
      update: { order },
      create: { key, order },
    });

    for (const locale of LOCALES) {
      const copy = DICTS[locale].faq.items[key];
      const data = { question: copy.question, answer: copy.answer };
      await prisma.faqTranslation.upsert({
        where: { faqId_locale: { faqId: row.id, locale } },
        update: data,
        create: { faqId: row.id, locale, ...data },
      });
    }
  }

  /* ---------------------------------------------------------------- stats */

  for (const [order, stat] of STATS.entries()) {
    const { key, ...figures } = stat;
    const row = await prisma.stat.upsert({
      where: { key },
      update: { ...figures, order },
      create: { key, ...figures, order },
    });

    for (const locale of LOCALES) {
      const copy = DICTS[locale].stats[key];
      const data = { label: copy.label, note: copy.note };
      await prisma.statTranslation.upsert({
        where: { statId_locale: { statId: row.id, locale } },
        update: data,
        create: { statId: row.id, locale, ...data },
      });
    }
  }

  console.log(
    "Seeded: " +
      SERVICES.length + " services, " +
      PHASES.length + " phases, " +
      SECTORS.length + " sectors, " +
      FAQS.length + " FAQs, " +
      STATS.length + " stats x " +
      LOCALES.length + " locales. Admin: " + email,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
