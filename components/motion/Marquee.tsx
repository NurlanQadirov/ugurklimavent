"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

import { cn } from "@/lib/utils";

/** Enough copies that the widest viewport never reaches the end of the track. */
const COPIES = 6;
/** Translating the track by exactly one copy is what makes the seam invisible. */
const SHIFT = 100 / COPIES;

/** Keeps a value inside [min, max) by wrapping, negative inputs included. */
function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return (((value - min) % range) + range) % range + min;
}

type MarqueeProps = {
  items: readonly string[];
  /**
   * Accessible name for the ticker. These are the company's capabilities, not
   * decoration, so the run is exposed as a named list rather than as a wall of
   * loose text — an answer engine parsing the page gets "capabilities: air
   * handling units, VRF systems, ..." instead of an unattributed word soup.
   */
  label?: string;
  /** Percent of the track travelled per second at rest. */
  speed?: number;
  className?: string;
};

/**
 * Capability ticker that reads the page's scroll velocity: it speeds up as you
 * scroll, reverses when you scroll back up, and shears a few degrees under
 * acceleration before settling. Idle, it drifts.
 *
 * The whole loop runs on motion values inside one animation frame callback —
 * no state, so no re-renders.
 */
export function Marquee({ items, label, speed = 1.6, className }: MarqueeProps) {
  const reduce = useReducedMotion();

  const baseX = useMotionValue(0);
  const direction = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 48,
    stiffness: 360,
    mass: 0.5,
  });

  // Unclamped: a hard flick should genuinely overrun the idle drift.
  const velocityFactor = useTransform(smoothVelocity, [0, 900], [0, 4], {
    clamp: false,
  });
  const skew = useTransform(smoothVelocity, [-2400, 0, 2400], [3.5, 0, -3.5], {
    clamp: true,
  });

  const transform = useMotionTemplate`translateX(${baseX}%) skewX(${skew}deg)`;

  useAnimationFrame((_, delta) => {
    if (reduce) return;

    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;

    // Idle drift, then the same amount again scaled by how hard we're scrolling.
    let moveBy = direction.current * speed * (delta / 1000);
    moveBy += moveBy * factor;

    baseX.set(wrap(-SHIFT, 0, baseX.get() + moveBy));
  });

  /*
   * `role="list"` / `role="listitem"` instead of real `<ul>`/`<li>` elements:
   * the track is one long inline run inside a transformed flex row, and swapping
   * in list elements would change the box tree the marquee measures itself
   * against. The roles give assistive tech and structured parsers the same
   * list semantics with a byte-identical layout.
   */
  const group = (
    <span role="list" className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} role="listitem" className="flex shrink-0 items-center">
          <span className="px-6 sm:px-8">{item}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-volt/50" />
        </span>
      ))}
    </span>
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "relative flex overflow-hidden py-6",
        "[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]",
        className,
      )}
    >
      <motion.div
        style={{ transform }}
        className="flex whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.22em] text-white/55 will-change-transform motion-reduce:transform-none!"
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <span key={copy} aria-hidden={copy > 0 || undefined} className="flex">
            {group}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
