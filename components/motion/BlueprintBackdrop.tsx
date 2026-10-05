"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { scrollY } = useScroll();
  // A function transform rather than an input/output range: the page has no
  // fixed height, and a range would pin the layer the moment scrolling passed
  // whatever constant we guessed.
  const raw = useTransform(scrollY, (latest) => -latest * speed);
  const smoothed = useSpring(raw, SPRING_PARALLAX);

  /**
   * A route change moves the page from wherever it was to the top in a single
   * frame, and the spring would then glide the layer across that whole
   * distance — thousands of pixels from the bottom of a long page, so the grid
   * visibly flew in from above after every navigation. Snap it instead: the
   * spring is there to soften scrolling, not to animate a page swap.
   */
  useEffect(() => {
    smoothed.jump(-window.scrollY * speed);
  }, [pathname, smoothed, speed]);
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
      {/*
        Coarse mesh — the slowest, deepest layer.

        No `opacity` wrapper any more. The utility now states its own final
        alpha, and stacking a second multiplier on top of it meant the grid had
        two places to be tuned from and no single value that described what was
        on screen. The mask stays: it is what keeps the lattice from running
        into the gutters, which is where a grid stops reading as structure and
        starts reading as wallpaper.
      */}
      <motion.div
        style={{ transform: meshTransform }}
        className="blueprint-mesh absolute -inset-y-[40vh] inset-x-0 motion-reduce:transform-none! [mask-image:radial-gradient(ellipse_75%_55%_at_50%_28%,#000_10%,transparent_72%)]"
      />

      {/* Fine grid, faster, so the two planes separate as you scroll */}
      <motion.div
        style={{ transform: fineTransform }}
        className="blueprint-mesh-fine absolute -inset-y-[40vh] inset-x-0 motion-reduce:transform-none! [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,#000_5%,transparent_70%)]"
      />

      {/*
        Ambient light.

        These two were a cold blue bloom — 7% volt under a 140px blur across
        most of the fold — and they were the single largest reason the page read
        as a product launch. Removing them outright would have left the ground
        dead flat, which is its own kind of cheap, so what is here now is the
        same two masses in neutral white at a fifth of the strength: enough that
        the upper third of the page is fractionally lighter than the lower, the
        way a room with one window is, and not enough to name a colour.
      */}
      <motion.div
        style={{ transform: bloomTransform }}
        className="absolute -inset-y-[30vh] inset-x-0 motion-reduce:transform-none!"
      >
        {/*
          Painted as radial gradients, not as blurred discs. A `blur()` this
          wide is re-rasterised by WebKit whenever the page under it changes,
          and on Safari and every iOS browser that cost about a second of frozen
          screen on every route change. Each box is grown by the old blur radius
          on all sides so the falloff reaches as far as the blur's did.
        */}
        <div className="absolute left-1/2 top-[calc(-18vh-160px)] h-[calc(70vh+320px)] w-[calc(85vw+320px)] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(255_255_255/0.016)_35%,transparent)]" />
        <div className="absolute right-[calc(-10vw-140px)] top-[calc(45vh-140px)] h-[calc(40vh+280px)] w-[calc(40vw+280px)] bg-[radial-gradient(closest-side,rgb(255_255_255/0.01)_25%,transparent)]" />
      </motion.div>

      {/* Horizon line — a single lit edge, the way a rendering has one */}
      <div className="absolute inset-x-0 top-[88vh] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
