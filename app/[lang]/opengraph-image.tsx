import { ImageResponse } from "next/og";

import { getDictionary } from "@/i18n/dictionaries";
import { LOCALES, isLocale } from "@/i18n/config";
import { getSiteContent } from "@/lib/site-content";

/**
 * The share card.
 *
 * Before this file, every link to the site — WhatsApp, Telegram, LinkedIn, a
 * Slack unfurl, an X post — rendered as a bare grey rectangle, and the
 * `summary_large_image` Twitter card declared in the layout had no image to
 * show. On a contracting site most inbound traffic arrives through exactly
 * those channels.
 *
 * Generated rather than checked in as a PNG so the headline stays in the
 * visitor's language and can never drift from the dictionary.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/**
 * A static export, so it cannot await the company record. The generic wording
 * is deliberate: `alt` describes the *image*, and a rename in the admin panel
 * must not be able to leave a stale legal name baked into the alt text of every
 * share card. The rendered card below still shows the live name.
 */
export const alt = "Share card";

/** Prerendered alongside the pages instead of rendered per request. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "az";
  const [dict, { company }] = await Promise.all([
    getDictionary(locale),
    getSiteContent(locale),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          padding: 80,
          // Matches the site's own ambient wash rather than inventing a look —
          // which now means a neutral one. A share card carrying a blue bloom
          // the page itself no longer has is the version of the brand most
          // people would see first.
          backgroundImage:
            "radial-gradient(900px circle at 15% 40%, rgba(255,255,255,0.05), transparent 62%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#a1a1aa",
            }}
          />
          {company.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#ffffff",
            maxWidth: 940,
          }}
        >
          {dict.hero.headingLines.join(" ")}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "rgba(255,255,255,0.40)",
          }}
        >
          <div style={{ display: "flex" }}>{dict.footer.address}</div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>
            {company.phones[0]}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
