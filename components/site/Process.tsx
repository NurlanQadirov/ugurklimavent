"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";

import { getProcess } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { VIEWPORT, cardChild, staggerParent } from "@/components/motion/tokens";
import { HeadingLines } from "./HeadingLines";

const SWAP = { type: "spring", duration: 0.45, bounce: 0.18 } as const;

export function Process() {
  const dict = useDictionary();
  const phases = getProcess(dict);

  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Measured from the middle of the viewport: a phase becomes "current" when it
  // reaches the reader's eyeline, not when it first peeks over the fold.
  const { scrollYProgress } = useScroll({
    target: rail,
    offset: ["start 0.55", "end 0.65"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.5,
  });
  const railFill = useMotionTemplate`scaleY(${smooth})`;
  const barFill = useMotionTemplate`scaleX(${smooth})`;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.min(
      phases.length - 1,
      Math.max(0, Math.floor(latest * phases.length)),
    );
    setActive((current) => (current === next ? current : next));
  });

  const current = phases[active];

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="section-y relative isolate mx-auto w-full max-w-6xl scroll-mt-24 px-6 sm:px-8"
    >
      <FlowLayer segment={3} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Sticky index column */}
        <div className="lg:col-span-4 lg:self-start lg:sticky lg:top-32">
          <Reveal>
            <RevealItem className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
                {dict.process.eyebrow}
              </span>
            </RevealItem>
            <RevealItem>
              <h2
                id="process-heading"
                className="text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white"
              >
                <HeadingLines lines={dict.process.headingLines} />
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-white/70">
                {dict.process.lede}
              </p>
            </RevealItem>
          </Reveal>

          {/* Live phase readout — the digits swap as the rail fills */}
          {/*
            Purely a scroll indicator: the phase number and the bar restate what
            the list beside them already says, and both change on every frame of
            a scroll. Announcing that to a screen reader is noise, so the whole
            readout is hidden rather than left to fire live-region-like updates.
          */}
          <div aria-hidden className="mt-12 hidden items-end gap-4 lg:flex">
            <div className="flex items-baseline font-mono text-[11px] tracking-[0.2em] text-white/30">
              <span className="relative inline-flex h-[1.2em] w-[2.2ch] overflow-hidden text-white">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={current.index}
                    initial={{ opacity: 0, transform: "translateY(100%)" }}
                    animate={{ opacity: 1, transform: "translateY(0%)" }}
                    exit={{ opacity: 0, transform: "translateY(-100%)" }}
                    transition={SWAP}
                    className="absolute inset-0"
                  >
                    {current.index}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>/ {String(phases.length).padStart(2, "0")}</span>
            </div>

            <div className="relative h-px flex-1 bg-white/10">
              <motion.div
                style={{ transform: barFill }}
                className="h-full origin-left bg-volt"
              />
            </div>
          </div>
        </div>

        {/* Phases */}
        <div ref={rail} className="relative mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
          {/* Progress rail */}
          <div
            aria-hidden
            className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-white/[0.08] sm:block"
          >
            {/* Scaling from the top puts the leading edge at the bottom, so
                that is the end that should be brightest. */}
            <motion.div
              style={{ transform: railFill }}
              className="h-full w-full origin-top bg-gradient-to-b from-volt/25 via-volt/80 to-volt"
            />
          </div>

          <motion.ol
            variants={staggerParent(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            aria-label={dict.a11y.processList}
            className="flex flex-col sm:pl-10"
          >
            {phases.map((phase, i) => (
              <motion.li
                key={phase.id}
                variants={cardChild}
                className="relative border-b border-white/[0.06] py-8 last:border-b-0 sm:py-10"
              >
                {/* Rail node */}
                <span
                  aria-hidden
                  className="absolute -left-10 top-[2.15rem] hidden h-1.5 w-1.5 -translate-x-[3px] rounded-full bg-void ring-1 ring-white/25 transition-all duration-300 ease-out-strong sm:block"
                  style={
                    i === active
                      ? {
                          backgroundColor: "var(--color-volt)",
                          boxShadow: "0 0 0 4px rgba(29,123,255,0.14)",
                        }
                      : undefined
                  }
                />

                {/* Dimming lives on its own layer: the reveal above owns the
                    variant chain, and two animations must never share a prop. */}
                <motion.div
                  animate={{ opacity: i === active ? 1 : 0.42 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                <div className="flex items-baseline gap-5">
                  <span
                    aria-hidden
                    className="font-mono text-[10px] tracking-[0.2em] text-white/30"
                  >
                    {phase.index}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                    {phase.title}
                  </h3>
                </div>

                <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-white/65 sm:pl-[3.4rem]">
                  {phase.blurb}
                </p>

                <ul
                  aria-label={dict.a11y.phaseOutputs}
                  className="mt-5 flex flex-wrap gap-1.5 sm:pl-[3.4rem]"
                >
                  {phase.outputs.map((output) => (
                    <li
                      key={output}
                      className="rounded-full border border-white/[0.16] bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/65"
                    >
                      {output}
                    </li>
                  ))}
                </ul>
                </motion.div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
