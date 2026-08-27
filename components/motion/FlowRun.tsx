"use client";

import { useId, useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";

import { RUN_LINES, RUN_VIEW, isPrimaryLine, runPath } from "@/lib/airflow";
import { cn } from "@/lib/utils";

type FlowRunProps = {
  /** Position in the run, top to bottom. Neighbouring segments share boundary coordinates. */
  segment: number;
  /** Positioning is the caller's: sections pass `absolute inset-0`, the hero a bottom band. */
  className?: string;
};

/**
 * One plate's segment of the duct run: static orthogonal risers, plus a lit head that
 * travels down them as the page scrolls, leaving the run behind it glowing.
 *
 * `['start center', 'end center']` is the whole trick. Progress is then exactly the
 * fraction of this segment lying above the viewport's centre line, so the head sits on
 * that line in every segment at once — segment N reaches 1 at the same instant segment
 * N+1 leaves 0. The result reads as a single light descending the entire page rather
 * than one animation per section, with no measurement and no shared state.
 */
export function FlowRun({ segment, className }: FlowRunProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `run-mask-${uid}`;
  const trailId = `run-trail-${uid}`;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const headY = useTransform(scrollYProgress, [0, 1], [0, RUN_VIEW]);
  const headTransform = useMotionTemplate`translate3d(0px, ${headY}px, 0)`;

  const paths = Array.from({ length: RUN_LINES }, (_, line) =>
    runPath(segment, line),
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none overflow-hidden", className)}
    >
      <svg
        viewBox={`0 0 ${RUN_VIEW} ${RUN_VIEW}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
      >
        <defs>
          {/*
            The travelling head, in white and at roughly a third of its old
            strength. Every stop below 0.985 used to be `volt`, which made the
            trail a blue tracer running the height of the document — the single
            most literal "tech product" gesture on the page, and the one a
            reader notices first because it is the only thing moving.

            Monochrome and dim, the same geometry reads as what it is meant to
            be: a duct run, lit by the section it is passing through. The near-
            white flare at the leading edge stays, because that tip is the only
            part that has to be legible for the effect to say anything at all.
          */}
          <linearGradient id={trailId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.93" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="0.985" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="-300"
            y="-1600"
            width="1600"
            height="3400"
          >
            {/* Mitred, not rounded: the elbow is the point of the whole treatment. */}
            <g fill="none" stroke="#fff" strokeLinejoin="miter" strokeLinecap="butt">
              {paths.map((d, line) => (
                <g key={d}>
                  {/* Halo pass — widens the head into a glow around the riser. */}
                  <path
                    d={d}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={isPrimaryLine(line) ? 10 : 7}
                    strokeOpacity="0.09"
                  />
                  {/* Core pass — the riser itself, at full luminance. */}
                  <path
                    d={d}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={isPrimaryLine(line) ? 2.4 : 1.4}
                    strokeOpacity="1"
                  />
                </g>
              ))}
            </g>
          </mask>
        </defs>

        {/* Resting run — always present, and the whole of it under reduced motion. */}
        <g
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.03"
          strokeLinejoin="miter"
          strokeLinecap="butt"
        >
          {paths.map((d, line) => (
            <path
              key={d}
              d={d}
              vectorEffect="non-scaling-stroke"
              strokeWidth={isPrimaryLine(line) ? 2 : 1.2}
            />
          ))}
        </g>

        {/*
          The trail sits entirely above the segment at rest and is pushed down by the
          head, so "already scrolled past" reads as "already lit". One rect, one
          transform — nothing here repaints per frame.
        */}
        <g mask={`url(#${maskId})`}>
          <motion.rect
            className="flow-head"
            x="-300"
            y={-RUN_VIEW * 1.2}
            width="1600"
            height={RUN_VIEW * 1.2}
            fill={`url(#${trailId})`}
            style={{ transform: headTransform }}
          />
        </g>
      </svg>
    </div>
  );
}
