import type { MetadataRoute } from "next";

import { LOCALES, LOCALE_TAGS } from "@/i18n/config";
import { ROUTES, absoluteUrl } from "@/lib/seo";

/**
 * Twelve URLs: four routes across three locales.
 *
 * Each entry repeats the full hreflang cluster under `alternates.languages`.
 * That is not redundant with the `<link rel="alternate">` tags in the document
 * head — Google treats the sitemap as an independent, and more reliable,
 * declaration of the cluster, because it does not depend on the crawler having
 * already fetched all three language variants to see them cross-reference each
 * other. A cluster confirmed from both sides is the one that actually swaps the
 * Russian result in for a Russian-language query.
 *
 * `lastModified` is build time. That is honest for a statically prerendered
 * marketing site: the content genuinely does change only when it is rebuilt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: absoluteUrl(locale, route),
      lastModified,
      changeFrequency: "monthly" as const,
      // The landing page outranks its own sub-routes, which are secondary
      // entry points onto sections it already contains.
      priority: route === "" ? 1 : 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(
            LOCALES.map((l) => [LOCALE_TAGS[l], absoluteUrl(l, route)]),
          ),
          "x-default": absoluteUrl("az", route),
        },
      },
    })),
  );
}
