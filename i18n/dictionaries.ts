import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./types";

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
