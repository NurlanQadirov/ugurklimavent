"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
} from "framer-motion";

/**
 * Hairline read-position indicator across the top of the viewport.
 *
 * `scaleX` on a full-width bar rather than an animated `width`, so the whole
 * thing stays on the compositor while the page is being scrolled.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });
  const transform = useMotionTemplate`scaleX(${smooth})`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px"
    >
      <motion.div
        style={{ transform }}
        className="h-full origin-left bg-gradient-to-r from-volt/0 via-volt to-white/70"
      />
    </div>
  );
}
