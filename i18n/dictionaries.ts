import "server-only";

import { getSiteContent } from "@/lib/site-content";

import type { Locale } from "./config";
import type { Dictionary, SiteDictionary } from "./types";

/**
 * Dynamic imports, so a request for `/az` never pulls the English or Russian
 * copy into the same chunk. All three run on the server only — the resulting
 * HTML is what reaches the browser.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  az: () => import("./dictionaries/az.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();

/**
 * The dictionary the pages render from: translated copy merged with the
 * database-backed content.
 *
 * Both halves are resolved here, once per request, so every consumer downstream
 * stays synchronous. The static JSON remains the source for everything the
 * admin panel does not manage — meta, nav, hero, manifesto, section headings
 * and the a11y strings — and remains the schema TypeScript checks `az.json` and
 * `ru.json` against.
 */
export async function getSiteDictionary(locale: Locale): Promise<SiteDictionary> {
  const [dict, content] = await Promise.all([
    getDictionary(locale),
    getSiteContent(locale),
  ]);

  return { ...dict, _content: content };
}
