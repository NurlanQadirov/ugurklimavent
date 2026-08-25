"use client";

import { motion } from "framer-motion";

import { getServices } from "@/lib/content";
import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { GlassCard } from "@/components/motion/GlassCard";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { VIEWPORT, cardChild, staggerParent } from "@/components/motion/tokens";
import { HeadingLines } from "./HeadingLines";
import { ServiceIcon } from "./ServiceIcon";

export function Expertise() {
  const dict = useDictionary();
  const { expertise } = dict;
  const services = getServices(dict);

  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="relative isolate mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 lg:py-40"
    >
      <FlowLayer segment={1} />

      <Reveal className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealItem className="mb-6 flex items-center gap-3">
            <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
              {expertise.eyebrow}
            </span>
          </RevealItem>
          <RevealItem>
            <h2
              id="expertise-heading"
              className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white"
            >
              <HeadingLines lines={expertise.headingLines} />
            </h2>
          </RevealItem>
        </div>
        <RevealItem className="max-w-sm">
          <p className="text-pretty text-sm leading-relaxed text-white/70">
            {expertise.lede}
          </p>
        </RevealItem>
      </Reveal>

      <motion.div
        variants={staggerParent(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        aria-label={dict.a11y.servicesList}
        className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        {services.map((service) => (
          <GlassCard
            key={service.id}
            variants={cardChild}
            accent={service.critical ? "alarm" : "volt"}
            className={service.span}
          >
            {/*
              `<article>`, not `<div>`. Each card is a self-contained
              description of one service — name, licence status, summary and the
              systems it covers — which is the textbook case for `article`. The
              practical payoff is on the GEO side: a generative engine chunking
              this page gets seven bounded units it can quote whole, instead of
              one 900-word grid it has to guess the boundaries of. `display` is
              set by the class either way, so the box is byte-identical.
            */}
            <article
              aria-labelledby={`service-${service.id}`}
              className="flex h-full flex-col justify-between gap-8 p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Sheet-index decoration, not part of the service name. */}
                <span
                  aria-hidden
                  className="font-mono text-[10px] tracking-[0.2em] text-white/25"
                >
                  {service.index}
                </span>
                <ServiceIcon
                  id={service.id}
                  className={
                    service.critical
                      ? "h-6 w-6 text-alarm/70"
                      : "h-6 w-6 text-white/60"
                  }
                />
              </div>

              <div>
                {service.critical ? (
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-alarm/25 bg-alarm/[0.06] px-2.5 py-1">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-alarm" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-alarm/80">
                      {expertise.licenceBadge}
                    </span>
                  </span>
                ) : null}

                <h3
                  id={`service-${service.id}`}
                  className="text-xl font-medium tracking-tight text-white sm:text-2xl"
                >
                  {service.title}
                </h3>
                <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-white/65">
                  {service.blurb}
                </p>

                <ul
                  aria-label={dict.a11y.serviceTags}
                  className="mt-6 flex flex-wrap gap-1.5"
                >
                  {service.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/[0.16] bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/65"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
