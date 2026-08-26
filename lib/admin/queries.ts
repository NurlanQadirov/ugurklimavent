import "server-only";

import { LOCALES, type Locale } from "@/i18n/config";
import { db } from "@/lib/db";
import { parseList } from "@/lib/serialize";

/**
 * Admin-side reads.
 *
 * Different from `lib/site-content.ts` in two ways that matter: these return
 * **all** locales rather than one, and they key on the database `id` rather than
 * the slug, because that is what the mutations take.
 *
 * Every row is flattened into a plain object before it crosses to a Client
 * Component. Prisma's `Date` fields and nested relation arrays are not worth
 * serialising into the payload when nothing in the table renders them.
 */

type Copy<T> = Record<Locale, T>;

/**
 * Locale-complete copy, with blanks for any locale missing a row.
 *
 * The forms bind directly to this, so it has to have a key for all three
 * languages whatever the database contains — a row seeded before a locale was
 * added must open in the editor as empty fields, not crash on `undefined`.
 */
function byLocale<T extends { locale: string }, R>(
  translations: T[],
  map: (row: T) => R,
  empty: R,
): Copy<R> {
  return Object.fromEntries(
    LOCALES.map((locale) => {
      const row = translations.find((t) => t.locale === locale);
      return [locale, row ? map(row) : empty];
    }),
  ) as Copy<R>;
}

export type ServiceRow = {
  id: string;
  key: string;
  iconPath: string | null;
  critical: boolean;
  order: number;
  translations: Copy<{ title: string; blurb: string; tags: string[] }>;
};

export async function listServices(): Promise<ServiceRow[]> {
  const rows = await db.service.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    iconPath: row.iconPath,
    critical: row.critical,
    order: row.order,
    translations: byLocale(
      row.translations,
      (t) => ({ title: t.title, blurb: t.blurb, tags: parseList(t.tags) }),
      { title: "", blurb: "", tags: [] },
    ),
  }));
}

export type FaqRow = {
  id: string;
  key: string;
  order: number;
  translations: Copy<{ question: string; answer: string }>;
};

export async function listFaqs(): Promise<FaqRow[]> {
  const rows = await db.faq.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    order: row.order,
    translations: byLocale(
      row.translations,
      (t) => ({ question: t.question, answer: t.answer }),
      { question: "", answer: "" },
    ),
  }));
}

export type SectorRow = {
  id: string;
  key: string;
  order: number;
  translations: Copy<{ name: string; detail: string }>;
};

export async function listSectors(): Promise<SectorRow[]> {
  const rows = await db.sector.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    order: row.order,
    translations: byLocale(
      row.translations,
      (t) => ({ name: t.name, detail: t.detail }),
      { name: "", detail: "" },
    ),
  }));
}

export type PhaseRow = {
  id: string;
  key: string;
  order: number;
  translations: Copy<{ title: string; blurb: string; outputs: string[] }>;
};

export async function listPhases(): Promise<PhaseRow[]> {
  const rows = await db.phase.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    order: row.order,
    translations: byLocale(
      row.translations,
      (t) => ({ title: t.title, blurb: t.blurb, outputs: parseList(t.outputs) }),
      { title: "", blurb: "", outputs: [] },
    ),
  }));
}

export type StatRow = {
  id: string;
  key: string;
  value: number;
  prefix: string;
  suffix: string;
  order: number;
  translations: Copy<{ label: string; note: string }>;
};

export async function listStats(): Promise<StatRow[]> {
  const rows = await db.stat.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    // Normalised to "" for the form inputs; the action turns blanks back into
    // NULL on the way in.
    prefix: row.prefix ?? "",
    suffix: row.suffix ?? "",
    order: row.order,
    translations: byLocale(
      row.translations,
      (t) => ({ label: t.label, note: t.note }),
      { label: "", note: "" },
    ),
  }));
}

export type CompanyRow = {
  name: string;
  short: string;
  email: string;
  phones: string[];
  addressStreet: string;
  addressDistrict: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
};

export async function getCompanySettings(): Promise<CompanyRow | null> {
  const row = await db.companySettings.findUnique({ where: { id: "company" } });
  if (!row) return null;

  return {
    name: row.name,
    short: row.short,
    email: row.email,
    phones: parseList(row.phones),
    addressStreet: row.addressStreet,
    addressDistrict: row.addressDistrict,
    addressLocality: row.addressLocality,
    addressRegion: row.addressRegion,
    addressCountry: row.addressCountry,
  };
}

/** Row counts for the dashboard tiles. */
export async function getCounts() {
  const [services, phases, sectors, faqs, stats] = await Promise.all([
    db.service.count(),
    db.phase.count(),
    db.sector.count(),
    db.faq.count(),
    db.stat.count(),
  ]);

  return { services, phases, sectors, faqs, stats };
}

/**
 * Rows that are missing copy in at least one locale.
 *
 * Surfaced on the dashboard because a half-translated row disappears from that
 * language's pages rather than erroring — silent by design, so it needs somewhere
 * to be visible.
 */
export async function getIncompleteTranslations() {
  const expected = LOCALES.length;

  const [services, phases, sectors, faqs, stats] = await Promise.all([
    db.service.findMany({ include: { translations: { select: { locale: true } } } }),
    db.phase.findMany({ include: { translations: { select: { locale: true } } } }),
    db.sector.findMany({ include: { translations: { select: { locale: true } } } }),
    db.faq.findMany({ include: { translations: { select: { locale: true } } } }),
    db.stat.findMany({ include: { translations: { select: { locale: true } } } }),
  ]);

  const gaps: { collection: string; key: string; missing: string[] }[] = [];

  const scan = (
    collection: string,
    rows: { key: string; translations: { locale: string }[] }[],
  ) => {
    for (const row of rows) {
      if (row.translations.length === expected) continue;
      const have = new Set(row.translations.map((t) => t.locale));
      gaps.push({
        collection,
        key: row.key,
        missing: LOCALES.filter((locale) => !have.has(locale)),
      });
    }
  };

  scan("Xidmətlər", services);
  scan("Mərhələlər", phases);
  scan("Sahələr", sectors);
  scan("Suallar", faqs);
  scan("Rəqəmlər", stats);

  return gaps;
}
