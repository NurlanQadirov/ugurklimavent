/**
 * Shared locale metadata. Deliberately dependency-free and free of `server-only`
 * so the proxy, Server Components and the client-side switcher can all read from
 * the same source of truth.
 */

export const LOCALES = ["az", "en", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

/** Azerbaijani is the home market, so an unmatched visitor lands there. */
export const DEFAULT_LOCALE: Locale = "az";

/** Label shown in the navbar switcher — short enough to sit inline. */
export const LOCALE_LABELS: Record<Locale, string> = {
  az: "Az",
  en: "En",
  ru: "Ru",
};

/** `lang` / `hreflang` attribute value for each locale. */
export const LOCALE_TAGS: Record<Locale, string> = {
  az: "az-AZ",
  en: "en",
  ru: "ru-RU",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
