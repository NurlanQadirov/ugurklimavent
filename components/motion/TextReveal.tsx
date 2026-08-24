"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { cn } from "@/lib/utils";

/** Opacity the not-yet-read words sit at. Legible, but clearly behind. */
const DIM = 0.13;
/** How many word-slots each word takes to resolve. >1 overlaps neighbours. */
const OVERLAP = 2.6;

/**
 * Every word's ramp is stated across the whole 0–1 domain — flat at `DIM`
 * before its turn, flat at full brightness after. Relying on Motion to clamp a
 * short range instead lets the compositor-accelerated path mirror the ramp back
 * down once scrolling continues past it, and the sentence un-reads itself.
 */
function ramp(start: number, end: number) {
  const stops = [0, start, end, 1];
  const values = [DIM, DIM, 1, 1];
  const inputRange: number[] = [];
  const outputRange: number[] = [];

  stops.forEach((stop, i) => {
    if (i > 0 && stop <= inputRange[inputRange.length - 1]) return;
    inputRange.push(stop);
    outputRange.push(values[i]);
  });

  return { inputRange, outputRange };
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) {
  const { inputRange, outputRange } = ramp(range[0], range[1]);
  const opacity = useTransform(progress, inputRange, outputRange);

  return (
    <motion.span
      style={{ opacity }}
      className={cn(
        "inline-block motion-reduce:opacity-100!",
        accent && "text-volt",
      )}
    >
      {children}
    </motion.span>
  );
}

/**
 * `*balanced*` and `*balanced*.` both mark the word — punctuation is allowed to
 * sit outside the closing marker, which is where a writer will naturally put it.
 */
const ACCENT = /^\*(.+?)\*([^\p{L}\p{N}]*)$/u;

type TextRevealProps = {
  /** Wrap a word in asterisks to tint it with the accent: `*balanced*`. */
  children: string;
  className?: string;
};

/**
 * Scroll-scrubbed reading light: words resolve out of the dark one after
 * another, tied to scroll position rather than to a timer — so the reader sets
 * the pace and can scrub back over the sentence.
 */
export function TextReveal({ children, className }: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  // Starts once the block is well inside the viewport, finishes above centre —
  // the sentence is fully lit while it is still comfortable to read.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  const words = children.split(/\s+/).filter(Boolean);
  const step = 1 / words.length;

  return (
    <p ref={ref} className={cn("text-balance", className)}>
      {words.map((raw, i) => {
        const marked = ACCENT.exec(raw);
        const accent = marked !== null;
        const word = marked ? marked[1] + marked[2] : raw;
        const key = `${word}-${i}`;

        // The separating space is a real text node, not a margin: a margin
        // between inline-blocks looks like a space but copies, and reads out,
        // as one run-on word.
        return (
          <Fragment key={key}>
            <Word
              progress={scrollYProgress}
              range={[i * step, Math.min(i * step + step * OVERLAP, 1)]}
              accent={accent}
            >
              {word}
            </Word>{" "}
          </Fragment>
        );
      })}
    </p>
  );
}
