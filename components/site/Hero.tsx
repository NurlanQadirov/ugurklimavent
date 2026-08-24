"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import { AirflowField } from "@/components/motion/AirflowField";
import { FlowRun } from "@/components/motion/FlowRun";
import { ImpellerDial } from "@/components/motion/ImpellerDial";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { riseChild, staggerParent } from "@/components/motion/tokens";

const HEADING_LINES = ["Engineered", "Climate &", "Safety Solutions"] as const;

/**
 * Type reveal: each line rides up from behind its own clipped box.
 * The percentage translate is relative to the line's own height, so it stays
 * correct at every breakpoint without a magic pixel value.
 */
const lineChild: Variants = {
  hidden: { opacity: 0, transform: "translateY(110%)" },
  visible: {
    opacity: 1,
    transform: "translateY(0%)",
    transition: { type: "spring", duration: 1.05, bounce: 0.14 },
  },
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Progress from "hero fills the viewport" to "hero has fully left the top".
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The fold recedes rather than scrolling away: it drifts up at less than page
  // speed, shrinks a hair and dissolves, so the section below arrives over it.
  const drift = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  // Stated across the full 0–1 domain rather than [0, 0.72] plus clamping:
  // Motion can hand a scroll-linked opacity to the compositor, and the native
  // timeline it generates does not honour the clamp — past the last stop the
  // value mirrors back and the hero fades *in* again on its way out.
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0, 0]);
  const transform = useMotionTemplate`translate3d(0px, ${drift}px, 0) scale(${scale})`;

  return (
    <section
      ref={ref}
      id="top"
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden px-6 pb-8 pt-32 sm:px-8 lg:pt-36"
    >
      {/*
        Backdrop. It shares the fold's fade but not its drift or scale, so the two
        planes separate as the page moves instead of leaving as one flat sheet.
      */}
      <motion.div
        aria-hidden
        style={{ opacity }}
        className="absolute inset-0 motion-reduce:opacity-100!"
      >
        <AirflowField className="absolute inset-0 opacity-80" />

        {/*
          The dial is pinned to the content shell rather than the viewport, so it lands
          in the empty column beside the headline and stays whole on wide screens
          instead of running off the edge. It is allowed to overhang the shell by a
          quarter of its width — the section clips it, which reads as the fan being
          bigger than the frame rather than shrunk to fit it.
        */}
        <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 lg:block">
          <ImpellerDial className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-[12%] opacity-60 xl:h-[500px] xl:w-[500px] 2xl:h-[560px] 2xl:w-[560px]" />
        </div>

        {/* Pins the copy's contrast wherever the sweeps and the rotor happen to be. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_90%_at_16%_50%,rgba(5,5,5,0.9),rgba(5,5,5,0.5)_52%,transparent_78%)]" />
      </motion.div>

      {/*
        Where the intake turns down: segment -1 of the site-wide duct run, which
        continues through every section below without a break — see lib/airflow.ts.
        It is deliberately left out of the fade, because the one place the continuity
        has to stay legible is exactly where it leaves the plate.
      */}
      <FlowRun
        segment={-1}
        className="absolute inset-x-0 bottom-0 h-[46%] opacity-70"
      />

      {/* Everything in the fold recedes together, meta row included. */}
      <motion.div
        style={{ transform, opacity }}
        className="flex flex-1 flex-col motion-reduce:transform-none! motion-reduce:opacity-100!"
      >
        {/*
         * `flex-1` centres the copy in whatever height is left over and the
         * meta row keeps its place in normal flow — positioning that row
         * absolutely would drop it on top of the call to action the moment the
         * headline wrapped to a fourth line.
         */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center">
          <motion.div
            variants={staggerParent(0.08, 0.15)}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            {/* Floating glass badge */}
            <motion.div variants={riseChild} className="mb-8 flex">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2.5 pr-4 backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alarm opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-alarm" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  24/7 Emergency Support
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={staggerParent(0.09)}
              className="max-w-5xl text-[clamp(2.75rem,8.4vw,8rem)] font-medium leading-none tracking-tighter text-white"
            >
              {HEADING_LINES.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span variants={lineChild} className="block">
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={riseChild}
              className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-white/45 sm:text-lg"
            >
              Precision HVAC, industrial cooling, and FHN-certified fire
              protection systems designed for maximum operational reliability.
            </motion.p>

            <motion.div variants={riseChild} className="mt-10">
              <MagneticLink href="#contact">
                Request Technical Audit
              </MagneticLink>
            </motion.div>
          </motion.div>
        </div>

        {/* Technical meta — drawing-sheet corners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none mx-auto flex w-full max-w-6xl shrink-0 items-end justify-between pt-10"
        >
          <div className="flex items-center gap-3">
            {/* Scroll cue: a lit segment falling down a dim track, on a loop. */}
            <span className="relative hidden h-8 w-px overflow-hidden bg-white/10 sm:block">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-transparent via-volt to-transparent"
                animate={{
                  transform: ["translateY(-100%)", "translateY(320%)"],
                }}
                transition={{
                  duration: 2.1,
                  ease: [0.65, 0, 0.35, 1],
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
              Scroll
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            Baku / AZ · 40.40°N 49.87°E
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
