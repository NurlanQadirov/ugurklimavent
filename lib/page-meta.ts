import type { Metadata } from "next";

import { LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSiteContent } from "@/lib/site-content";
import { absoluteUrl, languageAlternates, localePath } from "@/lib/seo";

/** The sub-routes, each keyed to its own block in `meta.pages`. */
export type SubRoute = "expertise" | "process" | "sectors" | "faq";

/**
 * Per-page metadata for the sub-routes.
 *
 * The important part is that this overrides **both** `alternates.canonical` and
 * `alternates.languages`. Metadata merges shallowly per key: a page that sets
 * only `canonical` keeps the layout's `languages` map, which still points every
 * hreflang at the locale root — so `/en/process` would advertise `/ru` as its
 * Russian equivalent. Building both from the same `route` keeps the cluster
 * self-consistent by construction.
 *
 * `title` is a plain string, so the layout's `%s — Uğur Klima Vent MMC`
 * template applies and the brand suffix is never duplicated by hand.
 */
export async function buildPageMetadata(
  lang: Locale,
  route: SubRoute,
): Promise<Metadata> {
  const [{ meta }, { company }] = await Promise.all([
    getDictionary(lang),
    getSiteContent(lang),
  ]);
  const page = meta.pages[route];
  const path = `/${route}` as const;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: localePath(lang, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: company.name,
      title: `${page.title} — ${company.name}`,
      description: page.description,
      url: absoluteUrl(lang, path),
      locale: LOCALE_TAGS[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_TAGS[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} — ${company.name}`,
      description: page.description,
    },
  };
}
