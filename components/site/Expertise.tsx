"use client";

import { motion } from "framer-motion";

import { SERVICES } from "@/lib/content";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { GlassCard } from "@/components/motion/GlassCard";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { VIEWPORT, cardChild, staggerParent } from "@/components/motion/tokens";
import { ServiceIcon } from "./ServiceIcon";

export function Expertise() {
  return (
    <section
      id="expertise"
      className="relative isolate mx-auto w-full max-w-6xl px-6 py-28 sm:px-8 lg:py-40"
    >
      <FlowLayer segment={1} />

      <Reveal className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealItem className="mb-6 flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-volt" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              Expertise
            </span>
          </RevealItem>
          <RevealItem>
            <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[0.95] tracking-tighter text-white">
              Seven disciplines,
              <br />
              one accountable contractor.
            </h2>
          </RevealItem>
        </div>
        <RevealItem className="max-w-sm">
          <p className="text-pretty text-sm leading-relaxed text-white/40">
            Design, supply, installation and commissioning handled in-house —
            so the mechanical, fire and electrical scopes never arrive at the
            same ceiling void with different assumptions.
          </p>
        </RevealItem>
      </Reveal>

      <motion.div
        variants={staggerParent(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        {SERVICES.map((service) => (
          <GlassCard
            key={service.id}
            variants={cardChild}
            accent={service.critical ? "alarm" : "volt"}
            className={service.span}
          >
            <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/25">
                  {service.index}
                </span>
                <ServiceIcon
                  id={service.id}
                  className={
                    service.critical
                      ? "h-6 w-6 text-alarm/70"
                      : "h-6 w-6 text-white/45"
                  }
                />
              </div>

              <div>
                {service.critical ? (
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-alarm/25 bg-alarm/[0.06] px-2.5 py-1">
                    <span className="h-1 w-1 rounded-full bg-alarm" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-alarm/80">
                      FHN Licensed
                    </span>
                  </span>
                ) : null}

                <h3 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-white/40">
                  {service.blurb}
                </p>

                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
