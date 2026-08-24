"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { LOCALES, LOCALE_LABELS, LOCALE_TAGS, isLocale } from "@/i18n/config";
import { useDictionary, useLocale } from "@/i18n/DictionaryProvider";
import { cn } from "@/lib/utils";

/**
 * Inline `Az / En / Ru` toggle.
 *
 * Deliberately motion-free: it rides in on the header's own entrance transform
 * rather than introducing a second animation into a bar that already runs a
 * scroll-driven variant on every frame. The only movement is the colour
 * transition already used by the navigation links beside it.
 *
 * These are plain `<a>` elements, *not* `next/link`, and that is load-bearing.
 * A client-side navigation across `[lang]` remounts the root layout, which
 * tears down and rebuilds the Lenis instance in `SmoothScroll` at the same
 * moment the router is applying its own scroll handling — the two race and the
 * page lands at the bottom. A full document load has no such race: the browser
 * starts a new document at the top and Lenis initialises against a settled
 * page. The locale routes are statically prerendered, so the reload is a plain
 * HTML fetch, and changing `<html lang>` for the whole document is what a
 * locale switch actually means.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const dict = useDictionary();
  const pathname = usePathname();

  /** Swap the locale segment and keep whatever path follows it. */
  const hrefFor = (locale: string) => {
    const segments = pathname.split("/");
    // segments[0] is the empty string before the leading slash.
    if (isLocale(segments[1] ?? "")) {
      segments[1] = locale;
      return segments.join("/");
    }
    return `/${locale}`;
  };

  return (
    <nav
      aria-label={dict.nav.language}
      className={cn("flex items-center text-[13px] leading-none", className)}
    >
      {LOCALES.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 ? (
            <span aria-hidden className="px-1 text-white/15 select-none">
              /
            </span>
          ) : null}

          {locale === active ? (
            <span aria-current="true" className="text-white font-medium">
              {LOCALE_LABELS[locale]}
            </span>
          ) : (
            <a
              href={hrefFor(locale)}
              hrefLang={LOCALE_TAGS[locale]}
              className="text-[13px] text-white/55 transition-colors duration-200 ease-out-strong hover:text-white"
            >
              {LOCALE_LABELS[locale]}
            </a>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
