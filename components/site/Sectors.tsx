"use client";

import { motion } from "framer-motion";

import { getSectors } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { VIEWPORT, riseChild, staggerParent } from "@/components/motion/tokens";
import { HeadingLines } from "./HeadingLines";

export function Sectors() {
  const dict = useDictionary();
  const sectors = getSectors(dict);

  return (
    <section
      id="sectors"
      aria-labelledby="sectors-heading"
      className="relative isolate mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 lg:py-40"
    >
      <FlowLayer segment={4} />

      <Reveal className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealItem className="mb-6 flex items-center gap-3">
            <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              {dict.sectors.eyebrow}
            </span>
          </RevealItem>
          <RevealItem>
            <h2
              id="sectors-heading"
              className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white"
            >
              <HeadingLines lines={dict.sectors.headingLines} />
            </h2>
          </RevealItem>
        </div>
        <Parallax distance={26} className="max-w-sm">
          <p className="text-pretty text-sm leading-relaxed text-white/40">
            {dict.sectors.lede}
          </p>
        </Parallax>
      </Reveal>

      <motion.ul
        variants={staggerParent(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        aria-label={dict.a11y.sectorsList}
        className="border-t border-white/[0.07]"
      >
        {sectors.map((sector, i) => (
          <motion.li
            key={sector.id}
            variants={riseChild}
            className="group relative isolate border-b border-white/[0.07]"
          >
            {/* Hover wash — a wipe, not a fade, so the direction reads */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-gradient-to-r from-white/[0.05] to-transparent transition-transform duration-500 ease-out-strong group-hover:scale-x-100"
            />

            <div className="flex flex-col gap-2 py-7 transition-transform duration-500 ease-out-strong motion-safe:group-hover:translate-x-3 sm:flex-row sm:items-baseline sm:gap-8 sm:py-8">
              {/* The row number is the list position, already announced. */}
              <span
                aria-hidden
                className="font-mono text-[10px] tracking-[0.2em] text-white/25 sm:w-10"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="flex-1 text-[clamp(1.35rem,3vw,2.25rem)] font-medium leading-none tracking-tight text-white/85 transition-colors duration-300 ease-out-strong group-hover:text-white">
                {sector.name}
              </h3>

              <p className="text-[13px] leading-relaxed text-white/35 transition-colors duration-300 ease-out-strong group-hover:text-white/60 sm:max-w-xs sm:text-right">
                {sector.detail}
              </p>

              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="hidden h-3.5 w-3.5 shrink-0 text-volt opacity-0 transition-all duration-300 ease-out-strong group-hover:opacity-100 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 sm:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
              </svg>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
