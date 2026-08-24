import type { Metadata } from "next";

import { LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { COMPANY } from "@/lib/content";
import { absoluteUrl, languageAlternates, localePath } from "@/lib/seo";

/** The three sub-routes, each keyed to its own block in `meta.pages`. */
export type SubRoute = "expertise" | "process" | "sectors";

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
  const { meta } = await getDictionary(lang);
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
      siteName: COMPANY.name,
      title: `${page.title} — ${COMPANY.name}`,
      description: page.description,
      url: absoluteUrl(lang, path),
      locale: LOCALE_TAGS[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_TAGS[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} — ${COMPANY.name}`,
      description: page.description,
    },
  };
}
