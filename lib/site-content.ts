import "server-only";

import type { Locale } from "@/i18n/config";
import { slotSpan } from "@/lib/bento";
import { SERVICE_COUNT_STAT, type SiteContent } from "@/lib/content";
import { db } from "@/lib/db";
import { parseList } from "@/lib/serialize";

/**
 * Reads the managed content out of the database and returns it in exactly the
 * shape `lib/content.ts` used to build from the static arrays.
 *
 * The public site never touches this module directly. It is folded into the
 * dictionary by `getSiteDictionary` and reaches the Client Components through
 * the existing `DictionaryProvider`, which is why not one section component had
 * to change to move off the hardcoded content.
 *
 * `id` is deliberately the **slug**, not the database primary key. The slug is
 * what `ServiceIcon` switches on and what the `aria-labelledby` ids are built
 * from, so keeping it in that field preserves the rendered markup byte for
 * byte. The admin panel works in database ids and never sees these types.
 */

/**
 * Rows whose translation for this locale is missing are skipped rather than
 * rendered blank. A half-translated row added through the admin panel should be
 * invisible until it has copy, not a card with an empty heading.
 */
function pick<T>(translations: readonly T[]): T | undefined {
  return translations[0];
}

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const where = { where: { locale } } as const;

  const [services, stats, phases, sectors, faqs, company] = await Promise.all([
    db.service.findMany({
      orderBy: { order: "asc" },
      include: { translations: where },
    }),
    db.stat.findMany({
      orderBy: { order: "asc" },
      include: { translations: where },
    }),
    db.phase.findMany({
      orderBy: { order: "asc" },
      include: { translations: where },
    }),
    db.sector.findMany({
      orderBy: { order: "asc" },
      include: { translations: where },
    }),
    db.faq.findMany({
      orderBy: { order: "asc" },
      include: { translations: where },
    }),
    db.companySettings.findUnique({ where: { id: "company" } }),
  ]);

  if (!company) {
    throw new Error(
      "No company settings row found. Run `npm run db:seed` to populate the database.",
    );
  }

  /**
   * `span` **and `index`** are both assigned from the *rendered* position
   * rather than from stored values, so a gap in the order values — or a row
   * skipped for having no copy in this locale — still produces a grid that
   * tiles to six columns and a card sequence that counts 01, 02, 03 ...
   *
   * `index` used to be read straight off the row, which made the card number
   * and the card position two independent fields free to disagree — and they
   * did: the grid rendered 01, 03, 02, 04 in the DOM, at every breakpoint,
   * because the seeded `order` and the seeded `index` had been written in
   * different sequences. Deriving it is the only fix that cannot drift back,
   * and it needs no write to any database — including the ones this code has
   * never seen. The faq block below has always done exactly this.
   *
   * Hoisted out of the returned object because the stats block counts it: the
   * "disciplines in-house" figure is this list's length, and counting the
   * *rendered* list is what keeps the figure right in a locale where a service
   * was skipped for having no copy.
   */
  const renderedServices = services
    .flatMap((service) => {
      const copy = pick(service.translations);
      if (!copy) return [];
      return [
        {
          id: service.key,
          ...(service.iconPath ? { iconPath: service.iconPath } : {}),
          // Kept optional rather than always-boolean: the card checks
          // `service.critical ? … : null`, and `false` and `undefined` are
          // equivalent there, but the narrower type matches the old shape.
          ...(service.critical ? { critical: true as const } : {}),
          title: copy.title,
          blurb: copy.blurb,
          tags: parseList(copy.tags),
        },
      ];
    })
    .map((service, i) => ({
      ...service,
      index: String(i + 1).padStart(2, "0"),
      span: slotSpan(i),
    }));

  return {
    services: renderedServices,

    /**
     * `SERVICE_COUNT_STAT` is a count of the service cards, not a figure in its
     * own right, so it is resolved from the rendered list rather than read off
     * the row. The stored column is left alone and unread: a value that has to
     * be re-typed every time a service is added is a value that is wrong for
     * however long nobody notices.
     */
    stats: stats.flatMap((stat) => {
      const copy = pick(stat.translations);
      if (!copy) return [];
      return [
        {
          id: stat.key,
          value:
            stat.key === SERVICE_COUNT_STAT ? renderedServices.length : stat.value,
          ...(stat.prefix ? { prefix: stat.prefix } : {}),
          ...(stat.suffix ? { suffix: stat.suffix } : {}),
          label: copy.label,
          note: copy.note,
        },
      ];
    }),

    /**
     * `index` is derived from position here too, for the same reason it is on
     * services and faqs: a stored card number and a stored order are two
     * fields free to disagree, and the rendered sequence is the only one a
     * reader can see. Deriving it makes the numbering a rendering of the
     * order rather than a second claim about it.
     */
    phases: phases
      .flatMap((phase) => {
        const copy = pick(phase.translations);
        if (!copy) return [];
        return [
          {
            id: phase.key,
            title: copy.title,
            blurb: copy.blurb,
            outputs: parseList(copy.outputs),
          },
        ];
      })
      .map((phase, i) => ({ ...phase, index: String(i + 1).padStart(2, "0") })),

    sectors: sectors.flatMap((sector) => {
      const copy = pick(sector.translations);
      if (!copy) return [];
      return [{ id: sector.key, name: copy.name, detail: copy.detail }];
    }),

    /**
     * `index` is derived from position rather than stored, exactly as before:
     * the numbering is a rendering of the order, so a reordered or deleted FAQ
     * can never leave a gap like 01, 02, 04.
     */
    faqs: faqs
      .flatMap((faq) => {
        const copy = pick(faq.translations);
        if (!copy) return [];
        return [{ id: faq.key, question: copy.question, answer: copy.answer }];
      })
      .map((faq, i) => ({ ...faq, index: String(i + 1).padStart(2, "0") })),

    company: {
      name: company.name,
      short: company.short,
      phones: parseList(company.phones),
      email: company.email,
      address: {
        street: company.addressStreet,
        district: company.addressDistrict,
        locality: company.addressLocality,
        region: company.addressRegion,
        country: company.addressCountry,
      },
    },
  };
}
