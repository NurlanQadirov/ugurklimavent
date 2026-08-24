"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { getFaqs } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { VIEWPORT, riseChild, staggerParent } from "@/components/motion/tokens";
import { HeadingLines } from "./HeadingLines";

/** Matches the row-swap timing used by the phase readout in `Process`. */
const PANEL = { type: "spring", duration: 0.42, bounce: 0 } as const;

/**
 * Disclosure list, built on the WAI-ARIA accordion pattern.
 *
 * Two decisions are load-bearing and worth stating, because the obvious
 * implementations of each are wrong for this page:
 *
 * 1. **Every answer stays mounted.** The panel collapses to `height: 0` rather
 *    than unmounting through `AnimatePresence`. An unmounted answer is not in
 *    the HTML, and an answer that is not in the HTML cannot be indexed, cannot
 *    be lifted into an AI Overview, and cannot back the `FAQPage` node in the
 *    JSON-LD — Google requires the structured data to match content that is
 *    actually present on the page. Collapsing is a visual state here, not a
 *    rendering condition.
 *
 * 2. **`inert` rather than `aria-hidden`** on a closed panel. Both hide it from
 *    a screen reader, but `inert` also takes the text out of the tab and
 *    find-in-page order, which is what a sighted keyboard user expects from
 *    something they can see is closed. The text stays in the DOM either way.
 *
 * The first item opens by default: it puts a real answer on screen for a reader
 * who never clicks, and gives the section a visible baseline height instead of
 * eight identical rules.
 */
export function Faq() {
  const dict = useDictionary();
  const faqs = getFaqs(dict);
  const [open, setOpen] = useState<string | null>(faqs[0].id);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative isolate mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 lg:py-40"
    >
      <FlowLayer segment={5} />

      <Reveal className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealItem className="mb-6 flex items-center gap-3">
            <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              {dict.faq.eyebrow}
            </span>
          </RevealItem>
          <RevealItem>
            <h2
              id="faq-heading"
              className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white"
            >
              <HeadingLines lines={dict.faq.headingLines} />
            </h2>
          </RevealItem>
        </div>
        <Parallax distance={26} className="max-w-sm">
          <p className="text-pretty text-sm leading-relaxed text-white/40">
            {dict.faq.lede}
          </p>
        </Parallax>
      </Reveal>

      <motion.ul
        variants={staggerParent(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        aria-label={dict.a11y.faqList}
        className="border-t border-white/[0.07]"
      >
        {faqs.map((faq) => {
          const expanded = open === faq.id;

          return (
            <motion.li
              key={faq.id}
              variants={riseChild}
              className="group relative isolate border-b border-white/[0.07]"
            >
              {/* Hover wash — the same wipe the sector rows use. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-gradient-to-r from-white/[0.05] to-transparent transition-transform duration-500 ease-out-strong group-hover:scale-x-100"
              />

              {/*
                The button is wrapped in an `<h3>` rather than being one: a
                heading gives the question a place in the document outline — so
                a screen reader can jump between questions, and a crawler reads
                eight headings instead of eight buttons — while the button keeps
                the control semantics. This is the pattern the ARIA authoring
                practices specify, and the reason it is not just a `<button>`.
              */}
              <h3>
                <button
                  type="button"
                  id={`faq-question-${faq.id}`}
                  aria-expanded={expanded}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => setOpen(expanded ? null : faq.id)}
                  className="flex w-full items-start gap-5 py-7 text-left sm:gap-8 sm:py-8"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-white/25 sm:w-10"
                  >
                    {faq.index}
                  </span>

                  <span className="flex-1 text-pretty text-[clamp(1.05rem,2.2vw,1.5rem)] font-medium leading-snug tracking-tight text-white/85 transition-colors duration-300 ease-out-strong group-hover:text-white">
                    {faq.question}
                  </span>

                  {/*
                    Plus that becomes a minus: the vertical stroke rotates a
                    quarter turn onto the horizontal one. One rotating element
                    instead of two swapped icons, so there is nothing to
                    cross-fade and nothing to mis-measure.
                  */}
                  <span
                    aria-hidden
                    className="relative mt-2 h-3.5 w-3.5 shrink-0 text-volt"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                    <span
                      className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out-strong"
                      style={
                        expanded ? { transform: "translateX(-50%) rotate(90deg)" } : undefined
                      }
                    />
                  </span>
                </button>
              </h3>

              <motion.div
                id={`faq-answer-${faq.id}`}
                inert={!expanded}
                initial={false}
                animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                transition={PANEL}
                className="overflow-hidden"
              >
                <p className="max-w-2xl text-pretty pb-8 text-sm leading-relaxed text-white/45 sm:pl-[3.4rem]">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
