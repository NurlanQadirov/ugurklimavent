"use client";

import { telHref } from "@/lib/content";
import { useCompany, useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HeadingLines } from "./HeadingLines";
import { BrandLogo } from "./BrandLogo";

/**
 * Resolved when the module is first evaluated — which, for these statically
 * prerendered routes, is build time.
 *
 * TODO(client): that means the copyright year freezes until the next deploy. It
 * is correct today and wrong every January until the site is rebuilt. Either
 * keep a rebuild in the new-year checklist, or drop the year from the notice
 * entirely — "© Uğur Klima Vent MMC" is legally sufficient and cannot go stale.
 */
const YEAR = new Date().getFullYear();

export function Footer() {
  const { footer, a11y } = useDictionary();
  const COMPANY = useCompany();

  return (
    <footer
      id="contact"
      className="relative isolate scroll-mt-24 border-t border-white/[0.06]"
    >
      <FlowLayer segment={6} />
      {/* Closing call to action */}
      {/*
        The closing call to action gets more air above it than a mid-page
        section does — it is the end of the scroll, and the pause before it is
        doing work. The steps stay ahead of `section-y` at every breakpoint;
        left at the old values the override would now *shrink* the gap the
        wider rhythm just opened.
      */}
      <div className="section-y mx-auto w-full max-w-6xl px-6 pt-24 sm:px-8 md:pt-32 lg:pt-40">
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RevealItem className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
                {footer.eyebrow}
              </span>
            </RevealItem>
            <RevealItem>
              <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[1.1] tracking-tight text-white">
                <HeadingLines lines={footer.headingLines} />
              </h2>
            </RevealItem>
          </div>
          <RevealItem>
            {/* Hover is shadow only — see the note on the hero's button. */}
            <a href={telHref(COMPANY.phones[0])} className="bloom group inline-flex items-center justify-center gap-3 rounded-full bg-porcelain px-7 py-3.5 text-sm font-medium tracking-tight text-void transition-shadow duration-300 ease-out">
              {footer.cta}
              {/* Decoration — the label beside it already names the destination. */}
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-strong motion-safe:group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
              </svg>
            </a>
          </RevealItem>
        </Reveal>

        {/* Contact data */}
        {/*
          The contact block is a single raised well, not three cards: one border,
          one shadow, and hairline gaps between the cells. Three separately
          bordered boxes put six vertical rules across the footer where the
          design wants two.
        */}
        <Reveal
          stagger={0.06}
          className="lift mt-28 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.04] sm:grid-cols-3"
        >
          <RevealItem className="bg-carbon p-7 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {footer.telephone}
            </p>
            {/*
              `<address>` is the element for the contact details of the page's
              owner, and this block is exactly that. `not-italic` is added only
              to cancel the user-agent italics the element carries by default —
              Tailwind's preflight does not reset it — so the rendering is
              unchanged.
            */}
            <address className="mt-4 flex flex-col gap-1.5 not-italic">
              {COMPANY.phones.map((phone) => (
                <a
                  key={phone}
                  href={telHref(phone)}
                  aria-label={a11y.callPhone.replace("{value}", phone)}
                  className="w-fit text-[15px] tracking-tight text-ink transition-colors duration-200 ease-out-strong hover:text-white"
                >
                  {phone}
                </a>
              ))}
            </address>
          </RevealItem>

          <RevealItem className="bg-carbon p-7 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {footer.email}
            </p>
            <address className="mt-4 not-italic">
              <a
                href={`mailto:${COMPANY.email}`}
                aria-label={a11y.emailUs.replace("{value}", COMPANY.email)}
                className="block w-fit break-all text-[15px] tracking-tight text-ink transition-colors duration-200 ease-out-strong hover:text-white"
              >
                {COMPANY.email}
              </a>
            </address>
          </RevealItem>

          <RevealItem className="bg-carbon p-7 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {footer.office}
            </p>
            <address className="mt-4 not-italic text-[15px] leading-relaxed tracking-tight text-ink">
              {footer.address}
            </address>
          </RevealItem>
        </Reveal>
      </div>

      {/* Legal bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3 text-white/50">
            <BrandLogo />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              {COMPANY.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
              {footer.licence}
            </span>
            {/* `<time>` so the year is a parseable date, not a loose number. */}
            <span>
              © <time dateTime={String(YEAR)}>{YEAR}</time> — {footer.rights}
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 pb-6 text-right sm:px-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            {footer.credit}{" "}
            <a
              href="https://nurlanqadirov.az"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/45 transition-colors duration-200 ease-out-strong hover:text-white"
            >
              Nurlan Qadirov
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
