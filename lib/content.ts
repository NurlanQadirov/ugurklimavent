export type Service = {
  id: string;
  index: string;
  title: string;
  blurb: string;
  tags: readonly string[];
  /** Card footprint on the `lg` bento grid (6 columns). */
  span: string;
  /** Reserved for the FHN-licensed discipline — renders the alarm-red treatment. */
  critical?: boolean;
};

export const SERVICES: readonly Service[] = [
  {
    id: "ventilation",
    index: "01",
    title: "Ventilation & AHU",
    blurb:
      "Industrial air handling units, ducted supply and extract networks engineered for continuous-duty operation — balanced, commissioned and documented against design airflow.",
    tags: ["Air handling units", "Exhaust systems", "Duct balancing"],
    span: "lg:col-span-3 lg:row-span-2",
  },
  {
    id: "fire",
    index: "03",
    title: "Fire Protection",
    blurb:
      "Sprinkler networks and smoke evacuation systems, designed and commissioned under an active FHN license.",
    tags: ["Sprinkler systems", "Smoke evacuation"],
    span: "lg:col-span-3",
    critical: true,
  },
  {
    id: "cooling",
    index: "02",
    title: "Advanced Cooling",
    blurb:
      "VRF, cassette, ducted and multi-split systems, zoned for precise load matching across every occupied volume.",
    tags: ["VRF", "Cassette", "Ducted", "Multi-split"],
    span: "lg:col-span-3",
  },
  {
    id: "heating",
    index: "04",
    title: "Heating & Hydronics",
    blurb:
      "Boiler installations and centralised heating design, from plant room to final emitter.",
    tags: ["Boiler rooms", "Hydronic design"],
    span: "lg:col-span-2",
  },
  {
    id: "chillers",
    index: "05",
    title: "Chillers & Commercial",
    blurb:
      "Chiller plant and fancoil engineering sized for sustained commercial and industrial loads.",
    tags: ["Chiller plant", "Fancoil"],
    span: "lg:col-span-2",
  },
  {
    id: "kitchens",
    index: "06",
    title: "Commercial Kitchens",
    blurb:
      "Stainless steel extraction hoods, preparation tables and ongoing kitchen electrical maintenance.",
    tags: ["Hoods", "Steel tables", "Maintenance"],
    span: "lg:col-span-2",
  },
  {
    id: "infrastructure",
    index: "07",
    title: "Infrastructure",
    blurb:
      "CCTV monitoring and heavy-duty electrical wiring, installed to carry the plant it serves.",
    tags: ["CCTV", "Heavy-duty wiring", "Distribution"],
    span: "lg:col-span-6",
  },
] as const;

export const COMPANY = {
  name: "Uğur Klima Vent MMC",
  short: "Uğur Klima Vent",
  phones: ["+994 50 203 80 13", "+994 70 203 80 13"],
  email: "a.mamedov78@gmail.com",
  address: "Baku, Nasimi district, Alatava 2",
} as const;

/** `tel:` hrefs must be digit-only to dial reliably. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/* -------------------------------------------------------------------------- */
/* Headline figures                                                            */
/* -------------------------------------------------------------------------- */

export type Stat = {
  /** Counted up from 0 when the band scrolls into view. */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
};

/**
 * `7` is derived from the disciplines above and `24/7` is the support promise
 * already made in the hero.
 *
 * TODO(client): the years and commissioned-systems figures are placeholders —
 * replace both with the audited numbers before this goes live.
 */
export const STATS: readonly Stat[] = [
  {
    value: SERVICES.length,
    label: "Disciplines in-house",
    note: "Mechanical, fire and electrical scopes under one contract",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Emergency response",
    note: "Plant failures do not keep office hours",
  },
  {
    value: 12,
    suffix: "+",
    label: "Years on site",
    note: "Commissioning across Baku and the surrounding regions",
  },
  {
    value: 240,
    suffix: "+",
    label: "Systems commissioned",
    note: "Balanced against design airflow and documented",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Delivery method                                                             */
/* -------------------------------------------------------------------------- */

export type Phase = {
  id: string;
  index: string;
  title: string;
  blurb: string;
  /** Deliverables the client actually receives at the end of the phase. */
  outputs: readonly string[];
};

export const PROCESS: readonly Phase[] = [
  {
    id: "survey",
    index: "01",
    title: "Survey & load calculation",
    blurb:
      "We walk the building, measure what is already there and calculate the real thermal and airflow load — not the figure the previous contractor assumed.",
    outputs: ["Site survey", "Heat & airflow load", "Budget envelope"],
  },
  {
    id: "design",
    index: "02",
    title: "Design & documentation",
    blurb:
      "Duct routing, plant selection and single-line diagrams drawn against the architecture, with the fire and electrical scopes coordinated in the same model.",
    outputs: ["Layout drawings", "Plant schedule", "Coordination set"],
  },
  {
    id: "supply",
    index: "03",
    title: "Supply & procurement",
    blurb:
      "Equipment sourced against the schedule, delivered to programme, with sheet-metal and stainless fabrication produced in-house rather than subcontracted.",
    outputs: ["Equipment supply", "Fabrication", "Delivery programme"],
  },
  {
    id: "install",
    index: "04",
    title: "Installation",
    blurb:
      "Our own crews install the ductwork, plant, pipework and wiring — one accountable team in the ceiling void instead of four trades negotiating for the same 300mm.",
    outputs: ["Ductwork & plant", "Pipework", "Power & controls"],
  },
  {
    id: "commission",
    index: "05",
    title: "Commissioning & handover",
    blurb:
      "Every system balanced to its design figures, tested, certified and handed over with the documentation an inspection will ask for.",
    outputs: ["Airflow balancing", "Test certificates", "O&M manual"],
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Sectors                                                                     */
/* -------------------------------------------------------------------------- */

export const SECTORS = [
  { id: "industrial", name: "Industrial plants", detail: "Continuous-duty extract and process cooling" },
  { id: "retail", name: "Retail & malls", detail: "Large-volume air handling and smoke control" },
  { id: "hospitality", name: "Hotels & hospitality", detail: "Zoned VRF with quiet-hours acoustics" },
  { id: "kitchens", name: "Commercial kitchens", detail: "Stainless extraction and make-up air" },
  { id: "offices", name: "Office buildings", detail: "Fancoil and chiller plant with BMS tie-in" },
  { id: "residential", name: "Residential complexes", detail: "Central heating and multi-split installations" },
] as const;

/** Capability ticker — short enough to read at speed. */
export const CAPABILITIES = [
  "Air handling units",
  "VRF systems",
  "Sprinkler networks",
  "Smoke evacuation",
  "Chiller plant",
  "Boiler rooms",
  "Duct balancing",
  "Kitchen extraction",
  "CCTV & wiring",
  "FHN certified",
] as const;
