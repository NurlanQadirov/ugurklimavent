"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { VIEWPORT, riseChild, staggerParent } from "./tokens";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Seconds between children. 30–80ms is the readable range. */
  stagger?: number;
  delay?: number;
};

/**
 * Scroll reveal for marketing surfaces. Fires once — re-animating on every
 * scroll-by is an interface fighting its reader.
 */
export function Reveal({ stagger = 0.07, delay = 0, children, ...rest }: RevealProps) {
  return (
    <motion.div
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={riseChild} {...rest}>
      {children}
    </motion.div>
  );
}
