import "server-only";

import { getSiteContent } from "@/lib/site-content";

import type { Locale } from "./config";
import type { Dictionary, SiteDictionary } from "./types";

/**
 * WARNING — counts written into the copy by hand.
 *
 * Four strings per locale state a number that the database now owns, and none
 * of them can be derived: they are inflected prose in three languages, not
 * values. Nothing checks them. If a service or a faq is added or removed
 * through the admin panel, these go stale silently and stay stale until a
 * reader notices.
 *
 * This comment lives here rather than beside the strings because JSON has no
 * comments, and `types.ts` infers the whole dictionary shape from `en.json`,
 * so there is no per-field declaration to attach it to either.
 *
 *   meta.pages.expertise.h1     "Seven HVAC, fire and electrical disciplines"
 *   expertise.headingLines[0]   "Seven disciplines," / "Yeddi istiqamət,"
 *   faq.items.scope.answer      "...running seven disciplines in-house"
 *
 * All three follow the service count. `faq.lede` used to state the number of
 * questions as well and has been reworded not to — deleting a question is a
 * one-click operation in the panel, and the sentence was carrying a count that
 * meant nothing to a reader.
 */

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
