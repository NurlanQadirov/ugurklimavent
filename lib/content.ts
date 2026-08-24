import type { Dictionary } from "@/i18n/types";

/**
 * Structure lives here; words live in `i18n/dictionaries/*.json`.
 *
 * The split is deliberate: the bento footprint, the phase order, the index
 * labels and the headline figures are *design*, not copy. Keeping them out of
 * the translation files means a translator cannot accidentally reflow the grid,
 * and the layout is provably identical in all three languages.
 *
 * Each entry is keyed by an id that also keys the matching block in the
 * dictionary, so `Dictionary` typing catches a structure/copy mismatch at build
 * time rather than rendering `undefined`.
 */

/* -------------------------------------------------------------------------- */
/* Disciplines                                                                 */
/* -------------------------------------------------------------------------- */

type ServiceLayout = {
  id: keyof Dictionary["expertise"]["services"];
  index: string;
  /** Card footprint on the `lg` bento grid (6 columns). */
  span: string;
  /** Reserved for the FHN-licensed discipline — renders the alarm-red treatment. */
  critical?: boolean;
};

const SERVICE_LAYOUT: readonly ServiceLayout[] = [
  { id: "ventilation", index: "01", span: "lg:col-span-3 lg:row-span-2" },
  { id: "fire", index: "03", span: "lg:col-span-3", critical: true },
  { id: "cooling", index: "02", span: "lg:col-span-3" },
  { id: "heating", index: "04", span: "lg:col-span-2" },
  { id: "chillers", index: "05", span: "lg:col-span-2" },
  { id: "kitchens", index: "06", span: "lg:col-span-2" },
  { id: "infrastructure", index: "07", span: "lg:col-span-6" },
] as const;

export type Service = ServiceLayout & {
  title: string;
  blurb: string;
  tags: readonly string[];
};

export function getServices(dict: Dictionary): readonly Service[] {
  return SERVICE_LAYOUT.map((layout) => ({
    ...layout,
    ...dict.expertise.services[layout.id],
  }));
}

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

/** Not translated — a phone number and a legal name read the same everywhere. */
export const COMPANY = {
  name: "Uğur Klima Vent MMC",
  short: "Uğur Klima Vent",
  phones: ["+994 50 203 80 13", "+994 70 203 80 13"],
  email: "a.mamedov78@gmail.com",
  /**
   * The address broken into its parts, for `PostalAddress` in the JSON-LD.
   *
   * `footer.address` stays in the dictionary because it is *displayed* copy and
   * each locale spells the district its own way. This is the same address as
   * data: a crawler needs `streetAddress` and `addressLocality` in separate
   * fields, and feeding it the display string would repeat the city inside the
   * street line — which is how a listing ends up unmatched against the map.
   *
   * TODO(client): add `postalCode` once confirmed. Google weights a complete
   * `PostalAddress` when reconciling a site with a Business Profile.
   */
  address: {
    street: "Alatava 2",
    district: "Nasimi",
    locality: "Baku",
    region: "Baku",
    country: "AZ",
  },
} as const;

/** `tel:` hrefs must be digit-only to dial reliably. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/* -------------------------------------------------------------------------- */
/* Headline figures                                                            */
/* -------------------------------------------------------------------------- */

type StatFigure = {
  id: keyof Dictionary["stats"];
  /** Counted up from 0 when the band scrolls into view. */
  value: number;
  prefix?: string;
  suffix?: string;
};

/**
 * `7` is derived from the disciplines above and `24/7` is the support promise
 * already made in the hero.
 *
 * TODO(client): the years and commissioned-systems figures are placeholders —
 * replace both with the audited numbers before this goes live.
 */
const STAT_FIGURES: readonly StatFigure[] = [
  { id: "disciplines", value: SERVICE_LAYOUT.length },
  { id: "response", value: 24, suffix: "/7" },
  { id: "years", value: 12, suffix: "+" },
  { id: "systems", value: 240, suffix: "+" },
] as const;

export type Stat = StatFigure & {
  label: string;
  note: string;
};

export function getStats(dict: Dictionary): readonly Stat[] {
  return STAT_FIGURES.map((figure) => ({
    ...figure,
    ...dict.stats[figure.id],
  }));
}

/* -------------------------------------------------------------------------- */
/* Delivery method                                                             */
/* -------------------------------------------------------------------------- */

type PhaseLayout = {
  id: keyof Dictionary["process"]["phases"];
  index: string;
};

const PHASE_LAYOUT: readonly PhaseLayout[] = [
  { id: "survey", index: "01" },
  { id: "design", index: "02" },
  { id: "supply", index: "03" },
  { id: "install", index: "04" },
  { id: "commission", index: "05" },
] as const;

export type Phase = PhaseLayout & {
  title: string;
  blurb: string;
  /** Deliverables the client actually receives at the end of the phase. */
  outputs: readonly string[];
};

export function getProcess(dict: Dictionary): readonly Phase[] {
  return PHASE_LAYOUT.map((layout) => ({
    ...layout,
    ...dict.process.phases[layout.id],
  }));
}

/* -------------------------------------------------------------------------- */
/* Sectors                                                                     */
/* -------------------------------------------------------------------------- */

const SECTOR_IDS = [
  "industrial",
  "retail",
  "hospitality",
  "kitchens",
  "offices",
  "residential",
] as const satisfies readonly (keyof Dictionary["sectors"]["items"])[];

export type Sector = {
  id: (typeof SECTOR_IDS)[number];
  name: string;
  detail: string;
};

export function getSectors(dict: Dictionary): readonly Sector[] {
  return SECTOR_IDS.map((id) => ({ id, ...dict.sectors.items[id] }));
}

/* -------------------------------------------------------------------------- */
/* Frequently asked questions                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Order is structure, so it lives here rather than in the dictionaries — and it
 * is not arbitrary. The questions run roughly in the order a real first call
 * goes: what do you actually do, are you licensed, how long, what do I get,
 * what does it cost, do you come to me, what if it breaks, will you touch
 * someone else's work.
 *
 * That ordering also happens to be what a generative engine rewards: the
 * highest-intent question sits first in the `FAQPage` node, and an engine that
 * quotes only the opening item still quotes the one that matters most.
 */
const FAQ_IDS = [
  "scope",
  "licence",
  "duration",
  "documents",
  "pricing",
  "coverage",
  "emergency",
  "existing",
] as const satisfies readonly (keyof Dictionary["faq"]["items"])[];

export type FaqItem = {
  id: (typeof FAQ_IDS)[number];
  index: string;
  question: string;
  answer: string;
};

export function getFaqs(dict: Dictionary): readonly FaqItem[] {
  return FAQ_IDS.map((id, i) => ({
    id,
    index: String(i + 1).padStart(2, "0"),
    ...dict.faq.items[id],
  }));
}
