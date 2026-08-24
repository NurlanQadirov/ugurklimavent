import { LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/config";

/**
 * Single source of truth for the site's absolute origin.
 *
 * Everything that has to be a fully qualified URL — `metadataBase`, canonicals,
 * hreflang alternates, the sitemap, every `@id` in the JSON-LD graph — is built
 * from this constant, so the production domain is changed in exactly one place.
 *
 * TODO(client): set `NEXT_PUBLIC_SITE_URL` in the deployment environment. The
 * fallback below is a placeholder — an unset origin silently ships canonicals
 * pointing at the wrong host, which is worse than no canonical at all.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ugurklimavent.az"
).replace(/\/$/, "");

/** Routes that exist under every locale. `""` is the locale root. */
export const ROUTES = ["", "/expertise", "/process", "/sectors"] as const;

export type Route = (typeof ROUTES)[number];

/** `/az/expertise` — the canonical path shape for a locale + route pair. */
export const localePath = (locale: Locale, route: Route = ""): string =>
  `/${locale}${route}`;

/** Absolute URL for a locale + route pair. */
export const absoluteUrl = (locale: Locale, route: Route = ""): string =>
  `${SITE_URL}${localePath(locale, route)}`;

/**
 * hreflang map for one route across every locale.
 *
 * `x-default` is required by Google whenever a page has language alternates: it
 * names the URL to serve a visitor whose language matches none of the published
 * ones. Without it the three locales compete for the same query and Google
 * picks one arbitrarily. Azerbaijani is the home market, so it is the default.
 */
export function languageAlternates(route: Route = ""): Record<string, string> {
  return {
    ...Object.fromEntries(
      LOCALES.map((locale) => [LOCALE_TAGS[locale], localePath(locale, route)]),
    ),
    "x-default": localePath("az", route),
  };
}
