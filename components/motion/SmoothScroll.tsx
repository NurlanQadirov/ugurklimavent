"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { setLenis } from "./lenis-instance";

/** Clears the fixed navbar when an in-page anchor is followed. */
const ANCHOR_OFFSET = -96;

/**
 * Inertial scrolling.
 *
 * Lenis drives the *native* scroll position every frame rather than
 * transforming a container, so `position: fixed`, `position: sticky` and
 * Motion's `useScroll` all keep working exactly as they do without it.
 *
 * Mounted as a leaf so the tree above it stays a server component.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;

    function sync() {
      // Hijacking the scroll wheel is exactly what "reduce motion" is asking
      // us not to do, so we hand the page back to the browser instead.
      if (reduce.matches) {
        lenis?.destroy();
        lenis = null;
        setLenis(null);
        return;
      }

      if (lenis) return;

      lenis = new Lenis({
        // Low lerp = long glide. Above ~0.12 the inertia stops reading as
        // deliberate and starts reading as lag.
        lerp: 0.085,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.6,
        // Touch devices already have native inertia; a second layer fights it.
        syncTouch: false,
        anchors: { offset: ANCHOR_OFFSET, duration: 1.4 },
        autoRaf: true,
      });

      // Published so the mobile menu can pause the page behind its overlay.
      setLenis(lenis);
    }

    sync();
    reduce.addEventListener("change", sync);

    return () => {
      reduce.removeEventListener("change", sync);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
