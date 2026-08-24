"use client";

import { CAPABILITIES } from "@/lib/content";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

const STATEMENT =
  "A ventilation system is only as honest as the day it was *commissioned*. " +
  "We design, install and balance every scope in-house — so the airflow on the drawing " +
  "is the airflow in the *room*.";

export function Manifesto() {
  return (
    <section className="relative isolate">
      <FlowLayer segment={0} />

      <div className="border-y border-white/[0.06] bg-white/[0.012]">
        <Marquee items={CAPABILITIES} />
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-28 sm:px-8 lg:py-40">
        <Reveal className="mb-10">
          <RevealItem className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-volt" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              Approach
            </span>
          </RevealItem>
        </Reveal>

        <TextReveal className="text-[clamp(1.55rem,4vw,3rem)] font-medium leading-[1.18] tracking-tight text-white">
          {STATEMENT}
        </TextReveal>
      </div>
    </section>
  );
}
