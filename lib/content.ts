import type { SiteDictionary } from "@/i18n/types";

/**
 * Shape of the managed content, and the accessors the site renders through.
 *
 * Structure and copy used to live in two places — the layout arrays in this
 * file and the words in `i18n/dictionaries/*.json`. Both now come from the
 * database, but the split survives in the schema: a `Service` row carries the
 * bento footprint and the index label, a `ServiceTranslation` row carries the
 * words. A translator still cannot reflow the grid.
 *
 * The accessors below keep the exact signatures they had when the data was
 * hardcoded. `getServices(dict)` still takes the dictionary and still returns
 * the same object shape, so every section component reads unchanged — the
 * database swap happens above them, where the server folds the content into the
 * dictionary it already hands to `DictionaryProvider`.
 *
 * `id` is the slug, not the database key. See `lib/site-content.ts` for why.
 */

export type Service = {
  id: string;
  index: string;
  /**
   * Card footprint on the `lg` bento grid (6 columns).
   *
   * Derived from the service's position, not stored — see `lib/bento.ts`. The
   * shape of this field is unchanged, so the grid renders exactly as before.
   */
  span: string;
  /** Uploaded icon path, or `undefined` to use the built-in glyph for `id`. */
  iconPath?: string;
  /** The FHN-licensed discipline renders the alarm-red treatment. */
  critical?: boolean;
  title: string;
  blurb: string;
  tags: readonly string[];
};

export type Stat = {
  id: string;
  /** Counted up from 0 when the band scrolls into view. */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
};

export type Phase = {
  id: string;
  index: string;
  title: string;
  blurb: string;
  /** Deliverables the client actually receives at the end of the phase. */
  outputs: readonly string[];
};

export type Sector = {
  id: string;
  name: string;
  detail: string;
};

export type FaqItem = {
  id: string;
  index: string;
  question: string;
  answer: string;
};

/** Not translated — a phone number and a legal name read the same everywhere. */
export type Company = {
  name: string;
  short: string;
  phones: readonly string[];
  email: string;
  /**
   * The address broken into its parts, for `PostalAddress` in the JSON-LD.
   *
   * `footer.address` stays in the dictionary because it is *displayed* copy and
   * each locale spells the district its own way. This is the same address as
   * data: a crawler needs `streetAddress` and `addressLocality` in separate
   * fields, and feeding it the display string would repeat the city inside the
   * street line — which is how a listing ends up unmatched against the map.
   */
  address: {
    street: string;
    district: string;
    locality: string;
    region: string;
    country: string;
  };
};

export type SiteContent = {
  services: readonly Service[];
  stats: readonly Stat[];
  phases: readonly Phase[];
  sectors: readonly Sector[];
  faqs: readonly FaqItem[];
  company: Company;
};

/* -------------------------------------------------------------------------- */
/* Accessors                                                                   */
/* -------------------------------------------------------------------------- */

export function getServices(dict: SiteDictionary): readonly Service[] {
  return dict._content.services;
}

export function getStats(dict: SiteDictionary): readonly Stat[] {
  return dict._content.stats;
}

export function getProcess(dict: SiteDictionary): readonly Phase[] {
  return dict._content.phases;
}

export function getSectors(dict: SiteDictionary): readonly Sector[] {
  return dict._content.sectors;
}

export function getFaqs(dict: SiteDictionary): readonly FaqItem[] {
  return dict._content.faqs;
}

export function getCompany(dict: SiteDictionary): Company {
  return dict._content.company;
}

/** `tel:` hrefs must be digit-only to dial reliably. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
