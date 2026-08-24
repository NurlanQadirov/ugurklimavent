import { LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  COMPANY,
  getFaqs,
  getProcess,
  getSectors,
  getServices,
} from "@/lib/content";
import { SITE_URL, absoluteUrl, type Route } from "@/lib/seo";

/**
 * Structured data for classic rich results *and* for generative engines.
 *
 * Two audiences, one graph:
 *
 * - Google/Bing read `HVACBusiness` for the local pack (name, phone, address,
 *   geo, opening hours) and `BreadcrumbList` for the SERP breadcrumb.
 * - Perplexity, ChatGPT Search, Gemini and Grok ground their answers on
 *   whatever explicit machine-readable facts a page offers. Prose says
 *   "seven disciplines"; only `hasOfferCatalog` says *which* seven, each with
 *   its own name, description and provider. That is the difference between
 *   being quoted as "an HVAC contractor in Baku" and being quoted as "the
 *   FHN-licensed contractor that does sprinkler networks and smoke evacuation".
 *
 * Everything below is derived from the same dictionary the page renders, so the
 * structured data can never drift from the visible copy — which is what
 * Google's structured-data guidelines require, and what stops an LLM citing a
 * service the site no longer offers.
 */

/* -------------------------------------------------------------------------- */
/* Stable node identifiers                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `@id`s are locale-scoped for pages but *not* for the company: there is one
 * legal entity, described in three languages. Giving each locale its own
 * organisation node would tell a crawler there are three companies in Baku with
 * the same phone number.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const pageId = (locale: Locale, route: Route) =>
  `${absoluteUrl(locale, route)}#webpage`;

/** Digits-only E.164, which is the format schema.org consumers expect. */
const e164 = (phone: string) => phone.replace(/[^\d+]/g, "");

/* -------------------------------------------------------------------------- */
/* Organisation                                                                */
/* -------------------------------------------------------------------------- */

/**
 * `HVACBusiness` rather than a bare `LocalBusiness`: it is the precise
 * schema.org subtype for this trade, it inherits every `LocalBusiness` and
 * `Organization` property (so `publisher` references still resolve), and it
 * hands an answer engine the industry classification without inference.
 */
function organization(dict: Dictionary) {
  return {
    "@type": "HVACBusiness",
    "@id": ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.name,
    alternateName: COMPANY.short,
    url: SITE_URL,
    description: dict.meta.description,
    telephone: COMPANY.phones.map(e164),
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${COMPANY.address.street}, ${COMPANY.address.district}`,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      addressCountry: COMPANY.address.country,
    },
    // From the hero's own coordinate readout — the two must agree.
    geo: { "@type": "GeoCoordinates", latitude: 40.4, longitude: 49.87 },
    areaServed: [
      { "@type": "City", name: "Baku" },
      { "@type": "Country", name: "Azerbaijan" },
    ],
    // The 24/7 emergency-response figure in the stats band, stated in the one
    // format a crawler can actually act on.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    // The licence is the single strongest differentiator on this site. Left in
    // prose it is a badge; as `hasCredential` it is a citable fact.
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: dict.expertise.licenceBadge,
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: "Ministry of Emergency Situations of the Republic of Azerbaijan (FHN)",
      },
    },
    knowsLanguage: LOCALES.map((locale) => LOCALE_TAGS[locale]),
    hasOfferCatalog: offerCatalog(dict),
    // TODO(client): add the company's real profile URLs here (Facebook,
    // Instagram, LinkedIn, Google Business Profile). `sameAs` is how an answer
    // engine confirms that the site, the map listing and the social profiles
    // are the same entity; an empty list is a missed reconciliation.
    sameAs: [] as string[],
  };
}

/** The seven disciplines, each as a first-class `Service`. */
function offerCatalog(dict: Dictionary) {
  return {
    "@type": "OfferCatalog",
    name: dict.expertise.eyebrow,
    itemListElement: getServices(dict).map((service, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        "@id": `${SITE_URL}/#service-${service.id}`,
        name: service.title,
        description: service.blurb,
        serviceType: service.title,
        category: service.tags.join(", "),
        provider: { "@id": ORG_ID },
        areaServed: { "@type": "City", name: "Baku" },
      },
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Site, pages and breadcrumbs                                                 */
/* -------------------------------------------------------------------------- */

function website(dict: Dictionary, locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: COMPANY.name,
    description: dict.meta.description,
    inLanguage: LOCALES.map((l) => LOCALE_TAGS[l]),
    publisher: { "@id": ORG_ID },
    // Declares the three language variants as one work in three expressions,
    // which is the machine-readable half of the hreflang cluster.
    workTranslation: LOCALES.filter((l) => l !== locale).map((l) => ({
      "@type": "WebSite",
      url: absoluteUrl(l),
      inLanguage: LOCALE_TAGS[l],
    })),
  };
}

function webPage(
  dict: Dictionary,
  locale: Locale,
  route: Route,
  { title, description }: { title: string; description: string },
) {
  return {
    "@type": route === "" ? "WebPage" : "CollectionPage",
    "@id": pageId(locale, route),
    url: absoluteUrl(locale, route),
    name: title,
    description,
    inLanguage: LOCALE_TAGS[locale],
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    breadcrumb: { "@id": `${absoluteUrl(locale, route)}#breadcrumb` },
  };
}

/**
 * A breadcrumb is emitted even for the locale root (a single "Home" crumb).
 * It costs nothing and it is what tells a crawler that `/az` — not `/` — is the
 * top of this language tree.
 */
function breadcrumb(dict: Dictionary, locale: Locale, route: Route) {
  const crumbs: { name: string; url: string }[] = [
    { name: dict.a11y.breadcrumbHome, url: absoluteUrl(locale) },
  ];

  if (route !== "") {
    const key = route.slice(1) as "expertise" | "process" | "sectors";
    crumbs.push({ name: dict.nav.links[key], url: absoluteUrl(locale, route) });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(locale, route)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Section-specific nodes                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The five delivery phases as an ordered `HowTo`.
 *
 * Google retired the `HowTo` *rich result* in 2023, so this earns no SERP
 * decoration — it is here purely for GEO. "How does an HVAC contractor in Baku
 * run a project?" is exactly the shape of question a generative engine answers
 * by lifting an ordered step list, and an explicit one beats making the model
 * infer order from a stack of headings.
 */
function howTo(dict: Dictionary, locale: Locale) {
  return {
    "@type": "HowTo",
    "@id": `${absoluteUrl(locale, "/process")}#howto`,
    name: dict.process.headingLines.join(" "),
    description: dict.process.lede,
    inLanguage: LOCALE_TAGS[locale],
    step: getProcess(dict).map((phase, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: phase.title,
      text: phase.blurb,
      // The deliverables are the reason a client cares about the phase.
      itemListElement: phase.outputs.map((output) => ({
        "@type": "HowToDirection",
        text: output,
      })),
    })),
  };
}

/** Sectors served, as an explicit list rather than six styled rows. */
function sectorList(dict: Dictionary, locale: Locale) {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(locale, "/sectors")}#sectors`,
    name: dict.sectors.headingLines.join(" "),
    description: dict.sectors.lede,
    itemListElement: getSectors(dict).map((sector, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: sector.name,
      description: sector.detail,
    })),
  };
}

/**
 * The eight questions as a `FAQPage`.
 *
 * Worth being clear about what this does and does not buy, because the received
 * wisdom is out of date in both directions:
 *
 * - It will **not** produce the collapsible FAQ rich result in Google. That was
 *   restricted to government and health sites in August 2023, and this is a
 *   contractor. Anyone promising the accordion in the SERP from this markup is
 *   selling a 2022 playbook.
 * - It is still one of the highest-value nodes on the site for GEO. A
 *   question/answer pair is the native unit of a generative answer: ChatGPT
 *   Search, Perplexity, Gemini and Copilot all lift `acceptedAnswer.text`
 *   directly when a user's prompt matches `name`, because the pairing removes
 *   every guess about where the answer starts and stops. Prose the model has to
 *   summarise loses to a sentence it can quote.
 *
 * Google also requires the marked-up Q&A to be visible on the page, which is why
 * `Faq.tsx` keeps every collapsed answer mounted in the DOM rather than
 * unmounting it.
 */
function faqPage(dict: Dictionary, locale: Locale) {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(locale)}#faq`,
    name: dict.faq.headingLines.join(" "),
    description: dict.faq.lede,
    inLanguage: LOCALE_TAGS[locale],
    isPartOf: { "@id": pageId(locale, "") },
    about: { "@id": ORG_ID },
    mainEntity: getFaqs(dict).map((faq) => ({
      "@type": "Question",
      "@id": `${absoluteUrl(locale)}#faq-${faq.id}`,
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        // Deep link to the row itself, so an engine that cites the answer can
        // send the reader to the exact question rather than the page top.
        url: `${absoluteUrl(locale)}#faq`,
      },
    })),
  };
}

/** The disciplines lifted out of the offer catalogue as a standalone list. */
function serviceList(dict: Dictionary, locale: Locale) {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(locale, "/expertise")}#services`,
    name: dict.expertise.headingLines.join(" "),
    description: dict.expertise.lede,
    itemListElement: getServices(dict).map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@id": `${SITE_URL}/#service-${service.id}` },
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Graph assembly                                                              */
/* -------------------------------------------------------------------------- */

/**
 * One `@graph` per page instead of several sibling `<script>` blocks.
 *
 * Nodes reference each other by `@id`, so the organisation is described once
 * and every page, service and breadcrumb points at that same node. A crawler
 * that stitches the graph gets one company with seven services; a crawler fed
 * four disconnected blobs has to guess.
 */
export function buildGraph({
  dict,
  locale,
  route,
  title,
  description,
}: {
  dict: Dictionary;
  locale: Locale;
  route: Route;
  title: string;
  description: string;
}) {
  const graph: Record<string, unknown>[] = [
    organization(dict),
    website(dict, locale),
    webPage(dict, locale, route, { title, description }),
    breadcrumb(dict, locale, route),
  ];

  // The landing page carries the full story because it is the URL an answer
  // engine is most likely to fetch; each sub-route carries only its own node,
  // so the same list is not counted twice against one site.
  if (route === "" || route === "/expertise") graph.push(serviceList(dict, locale));
  if (route === "" || route === "/process") graph.push(howTo(dict, locale));
  if (route === "" || route === "/sectors") graph.push(sectorList(dict, locale));
  // FAQ lives only on the landing page, so the node does too — a `FAQPage`
  // declared on a URL that does not show the questions is a guidelines
  // violation, not a shortcut.
  if (route === "") graph.push(faqPage(dict, locale));

  return { "@context": "https://schema.org", "@graph": graph };
}
