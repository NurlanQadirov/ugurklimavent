import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Sits in `app/` (not `app/[lang]/`) on purpose: `robots.txt` is a per-origin
 * file, not a per-locale one, and the proxy matcher already excludes it from
 * locale redirection.
 *
 * The AI crawlers are listed explicitly rather than left to the `*` rule. They
 * are already covered by it, but naming them is a deliberate, auditable opt-in:
 * GEO only works if the answer engines are actually allowed to read the site,
 * and a future "block the scrapers" edit should have to remove a named line
 * rather than silently inherit a change to the wildcard.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Classic search.
      { userAgent: ["Googlebot", "Bingbot", "YandexBot"], allow: "/" },
      // Generative engines. `OAI-SearchBot` and `PerplexityBot` fetch pages to
      // cite them in answers; `GPTBot`, `ClaudeBot` and `Google-Extended`
      // govern training/grounding corpora. All are wanted here — the whole
      // point of the structured data below is to be ingested.
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "PerplexityBot",
          "Perplexity-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "Google-Extended",
          "Applebot",
          "Applebot-Extended",
          "meta-externalagent",
          "Bytespider",
          "cohere-ai",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
