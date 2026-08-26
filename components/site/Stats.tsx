"use client";

import { motion } from "framer-motion";

import { getStats } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { Counter } from "@/components/motion/Counter";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { VIEWPORT, riseChild, staggerParent } from "@/components/motion/tokens";

/**
 * Whether a figure is a quantity that can be counted up to.
 *
 * "24/7" is stored the same way "12+" is — a value plus a suffix — but it is
 * not a quantity, it is a token that happens to contain digits. Counting it
 * renders "2/7", "14/7", "23/7" on the way up, which reads as a broken number
 * rather than as an animation. A digit in the suffix is the tell: "+" leaves
 * the figure a number, "/7" makes it half of a compound.
 */
const isCountable = (suffix?: string) => !/\d/.test(suffix ?? "");

/**
 * Divider rule: a 1px gap over a lit background, filled by opaque cells. One
 * declaration instead of a thicket of `nth-child` border resets, and it stays
 * correct at every column count.
 */
export function Stats() {
  const dict = useDictionary();
  const stats = getStats(dict);

  return (
    /*
      The band has no heading, so the landmark needs an explicit name — an
      unnamed `<section>` is not exposed as a region at all, and these four
      figures are the page's only hard numbers.
    */
    <section
      aria-label={dict.a11y.statsList}
      className="relative isolate border-y border-white/[0.06]"
    >
      <FlowLayer segment={2} />
      <motion.ul
        variants={staggerParent(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.li
            key={stat.id}
            variants={riseChild}
            className="group relative bg-void px-6 py-10 sm:px-8 sm:py-12"
          >
            {/* Accent wick — draws itself along the top edge on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-volt to-transparent transition-transform duration-500 ease-out-strong group-hover:scale-x-100"
            />

            <p className="flex items-baseline text-[clamp(2.5rem,6vw,4rem)] font-medium leading-none tracking-tighter text-white">
              {stat.prefix ? (
                <span className="text-white/40">{stat.prefix}</span>
              ) : null}
              {isCountable(stat.suffix) ? (
                <Counter value={stat.value} className="tabular-nums" />
              ) : (
                <span className="tabular-nums">{stat.value}</span>
              )}
              {stat.suffix ? (
                <span className="text-volt">{stat.suffix}</span>
              ) : null}
            </p>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
              {stat.label}
            </p>
            <p className="mt-2.5 max-w-[26ch] text-pretty text-[13px] leading-relaxed text-white/65">
              {stat.note}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
