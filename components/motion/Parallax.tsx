"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { SPRING_PARALLAX } from "./tokens";

type ParallaxProps = {
  children: ReactNode;
  /** Total travel in px across a full viewport of scrolling. Keep it under ~80. */
  distance?: number;
  className?: string;
};

/**
 * Depth for a single element: it drifts against the page as its own section
 * crosses the viewport. Positive `distance` lags the scroll (reads as further
 * away), negative leads it.
 *
 * Progress is measured on the element itself, so the drift is always centred on
 * the moment it is on screen — no global scroll constants to keep in sync.
 */
export function Parallax({
  children,
  distance = 48,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const smoothed = useSpring(raw, SPRING_PARALLAX);
  const transform = useMotionTemplate`translate3d(0px, ${smoothed}px, 0)`;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        style={{ transform }}
        className="motion-reduce:transform-none!"
      >
        {children}
      </motion.div>
    </div>
  );
}
