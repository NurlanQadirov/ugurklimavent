"use client";

import { COMPANY, telHref } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { HeadingLines } from "./HeadingLines";
import { Logo } from "./Logo";

const YEAR = new Date().getFullYear();

export function Footer() {
  const { footer } = useDictionary();

  return (
    <footer id="contact" className="relative isolate border-t border-white/[0.07]">
      <FlowLayer segment={5} />
      {/* Closing call to action */}
      <div className="mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 lg:py-36">
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RevealItem className="mb-6 flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-volt" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
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
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              {footer.telephone}
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              {COMPANY.phones.map((phone) => (
                <a
                  key={phone}
                  href={telHref(phone)}
                  className="w-fit text-[15px] tracking-tight text-white/70 transition-colors duration-200 ease-out-strong hover:text-white"
                >
                  {phone}
                </a>
              ))}
            </div>
          </RevealItem>

          <RevealItem className="bg-[#050505] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              {footer.email}
            </p>
            <a
              href={`mailto:${COMPANY.email}`}
              className="mt-4 block w-fit break-all text-[15px] tracking-tight text-white/70 transition-colors duration-200 ease-out-strong hover:text-white"
            >
              {COMPANY.email}
            </a>
          </RevealItem>

          <RevealItem className="bg-[#050505] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              {footer.office}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed tracking-tight text-white/70">
              {footer.address}
            </p>
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
              <span className="h-1 w-1 rounded-full bg-alarm" />
              {footer.licence}
            </span>
            <span>© {YEAR} — {footer.rights}</span>
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
