"use client";

import { COMPANY, telHref } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HeadingLines } from "./HeadingLines";
import { Logo } from "./Logo";

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

  return (
    <footer id="contact" className="relative isolate scroll-mt-24 border-t border-white/[0.07]">
      <FlowLayer segment={6} />
      {/* Closing call to action */}
      <div className="section-y mx-auto w-full max-w-6xl px-6 pt-24 sm:px-8 lg:pt-32">
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RevealItem className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
                {footer.eyebrow}
              </span>
            </RevealItem>
            <RevealItem>
              <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white">
                <HeadingLines lines={footer.headingLines} />
              </h2>
            </RevealItem>
          </div>
          <RevealItem>
            <MagneticLink href={telHref(COMPANY.phones[0])}>
              {footer.cta}
            </MagneticLink>
          </RevealItem>
        </Reveal>

        {/* Contact data */}
        <Reveal
          stagger={0.06}
          className="mt-24 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] sm:grid-cols-3"
        >
          <RevealItem className="bg-[#050505] p-7">
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
                  className="w-fit text-[15px] tracking-tight text-white/70 transition-colors duration-200 ease-out-strong hover:text-white"
                >
                  {phone}
                </a>
              ))}
            </address>
          </RevealItem>

          <RevealItem className="bg-[#050505] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {footer.email}
            </p>
            <address className="mt-4 not-italic">
              <a
                href={`mailto:${COMPANY.email}`}
                aria-label={a11y.emailUs.replace("{value}", COMPANY.email)}
                className="block w-fit break-all text-[15px] tracking-tight text-white/70 transition-colors duration-200 ease-out-strong hover:text-white"
              >
                {COMPANY.email}
              </a>
            </address>
          </RevealItem>

          <RevealItem className="bg-[#050505] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {footer.office}
            </p>
            <address className="mt-4 not-italic text-[15px] leading-relaxed tracking-tight text-white/70">
              {footer.address}
            </address>
          </RevealItem>
        </Reveal>
      </div>

      {/* Legal bar */}
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3 text-white/50">
            <Logo className="h-5 w-5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              {COMPANY.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-alarm" />
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
