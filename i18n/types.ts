/**
 * The English dictionary is the schema. Because `dictionaries.ts` types every
 * loader as `() => Promise<Dictionary>`, TypeScript structurally checks `az.json`
 * and `ru.json` against it — a missing or misspelled key is a build error, not a
 * blank string discovered in production.
 *
 * `import type` is erased at compile time, so pulling the schema in here costs a
 * Client Component nothing at runtime.
 */
import type enDictionary from "./dictionaries/en.json";
import type { SiteContent } from "@/lib/content";

export type Dictionary = typeof enDictionary;

/**
 * What the site actually renders from: the translated copy plus the content the
 * admin panel manages.
 *
 * The two are merged on the server and handed down through the existing
 * `DictionaryProvider`, so a Client Component reads database-backed services and
 * dictionary-backed section headings from one object without knowing that the
 * first group made a round trip to SQLite.
 *
 * `_content` is prefixed to keep it visibly distinct from the translated keys —
 * everything else on this object came out of a `.json` file that a translator
 * owns; this key did not.
 */
export type SiteDictionary = Dictionary & { _content: SiteContent };

export type ServiceCopy = Dictionary["expertise"]["services"][keyof Dictionary["expertise"]["services"]];
export type PhaseCopy = Dictionary["process"]["phases"][keyof Dictionary["process"]["phases"]];
export type StatCopy = Dictionary["stats"][keyof Dictionary["stats"]];
export type SectorCopy = Dictionary["sectors"]["items"][keyof Dictionary["sectors"]["items"]];
