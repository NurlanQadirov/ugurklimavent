"use client";

import { useDictionary } from "@/i18n/DictionaryProvider";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

export function Manifesto() {
  const { manifesto, capabilities, a11y } = useDictionary();

  return (
    <section aria-labelledby="manifesto-heading" className="relative isolate">
      <FlowLayer segment={0} />

      <div className="border-y border-white/[0.06] bg-white/[0.012]">
        <Marquee items={capabilities} label={a11y.capabilities} />
      </div>

      <div className="section-y mx-auto w-full max-w-5xl px-6 sm:px-8">
        <Reveal className="mb-10">
          <RevealItem className="flex items-center gap-3">
            <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />
            {/*
              The one section on the page with no heading of any level: the
              statement is a `<p>`, so the document outline jumped straight from
              the hero's `<h1>` to Expertise's `<h2>`. Promoting the eyebrow to
              an `<h2>` fills that gap.

              Zero visual change — Tailwind's preflight already resets heading
              `font-size` and `font-weight` to `inherit`, so every one of these
              classes applies exactly as it did to the `<span>`.
            */}
            <h2
              id="manifesto-heading"
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55"
            >
              {manifesto.eyebrow}
            </h2>
          </RevealItem>
        </Reveal>

        <TextReveal className="text-[clamp(1.55rem,4vw,3rem)] font-medium leading-[1.18] tracking-tight text-white">
          {manifesto.statement}
        </TextReveal>
      </div>
    </section>
  );
}
