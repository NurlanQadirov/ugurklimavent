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

export type Dictionary = typeof enDictionary;

export type ServiceCopy = Dictionary["expertise"]["services"][keyof Dictionary["expertise"]["services"]];
export type PhaseCopy = Dictionary["process"]["phases"][keyof Dictionary["process"]["phases"]];
export type StatCopy = Dictionary["stats"][keyof Dictionary["stats"]];
export type SectorCopy = Dictionary["sectors"]["items"][keyof Dictionary["sectors"]["items"]];
