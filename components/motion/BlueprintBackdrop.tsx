"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { SPRING_PARALLAX } from "./tokens";

/**
 * Scroll-linked architectural backdrop.
 *
 * Each layer is `fixed`, so its on-screen position is whatever we translate it
 * to. Translating by `-k * scrollY` makes the layer scroll at `k` times the
 * speed of the page: 0 is pinned, 1 tracks the content exactly.
 */
function useParallax(speed: number) {
  const { scrollY } = useScroll();
  // A function transform rather than an input/output range: the page has no
  // fixed height, and a range would pin the layer the moment scrolling passed
  // whatever constant we guessed.
  const raw = useTransform(scrollY, (latest) => -latest * speed);
  const smoothed = useSpring(raw, SPRING_PARALLAX);
  return useMotionTemplate`translate3d(0px, ${smoothed}px, 0)`;
}

export function BlueprintBackdrop() {
  const meshTransform = useParallax(0.14);
  const fineTransform = useParallax(0.3);
  const bloomTransform = useParallax(0.06);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Coarse blueprint grid — the slowest, deepest layer */}
      <motion.div
        style={{ transform: meshTransform }}
        className="blueprint-mesh absolute -inset-y-[40vh] inset-x-0 opacity-[0.55] motion-reduce:transform-none! [mask-image:radial-gradient(ellipse_75%_55%_at_50%_28%,#000_10%,transparent_72%)]"
      />

      {/* Fine grid, faster, so the two planes separate as you scroll */}
      <motion.div
        style={{ transform: fineTransform }}
        className="blueprint-mesh-fine absolute -inset-y-[40vh] inset-x-0 opacity-40 motion-reduce:transform-none! [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,#000_5%,transparent_70%)]"
      />

      {/* Cold ambient bloom behind the fold */}
      <motion.div
        style={{ transform: bloomTransform }}
        className="absolute -inset-y-[30vh] inset-x-0 motion-reduce:transform-none!"
      >
        <div className="absolute left-1/2 top-[-18vh] h-[70vh] w-[85vw] -translate-x-1/2 rounded-full bg-volt/[0.07] blur-[140px]" />
        <div className="absolute right-[-10vw] top-[45vh] h-[40vh] w-[40vw] rounded-full bg-volt/[0.04] blur-[120px]" />
      </motion.div>

      {/* Horizon line — a single lit edge, the way a rendering has one */}
      <div className="absolute inset-x-0 top-[88vh] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
