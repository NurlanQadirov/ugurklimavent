import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

/**
 * In Next 16 the `middleware` convention was renamed to `proxy` — same runtime,
 * same matcher, different file and export name.
 */

/** Remembers the visitor's explicit choice from the navbar switcher. */
const COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Minimal `Accept-Language` negotiation — no `negotiator`/`intl-localematcher`
 * dependency for three locales. Entries are ranked by their `q` weight and the
 * first one whose base tag we publish wins (`ru-RU` matches `ru`).
 */
function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag.length > 0 && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const match = LOCALES.find((locale) => locale === base);
    if (match) return match;
  }

  return null;
}

function resolveLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(COOKIE)?.value;
  if (saved && (LOCALES as readonly string[]).includes(saved)) {
    return saved as Locale;
  }
  return fromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const current = LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // Already on a locale route — keep the cookie in step with what is being read
  // so a later visit to `/` lands on the same language.
  if (current) {
    const response = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== current) {
      response.cookies.set(COOKIE, current, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      });
    }
    return response;
  }

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, the metadata files and anything in
  // `public/` — a bare matcher would redirect the CSS and the favicon too.
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
  ],
};
