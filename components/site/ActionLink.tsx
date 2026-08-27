"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { SPRING_SNAP } from "@/components/motion/tokens";

type Variant = "solid" | "ghost";

type ActionLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  /*
   * The page's one large light mass. `bg-porcelain` rather than `bg-white`:
   * at #FFFFFF this button clips against the near-black ground hard enough to
   * read as a system dialog dropped onto the page.
   */
  solid:
    "bloom bg-porcelain px-7 py-3.5 text-sm text-void",
  /*
   * The bar's call to action. A hairline and a breath of fill — it has to sit
   * beside the nav links without out-weighing the solid button further down
   * the page.
   */
  ghost:
    "border border-white/10 bg-white/[0.02] px-4 py-2 text-[13px] text-white/80 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
};

/**
 * The site's call to action, in one place.
 *
 * **One element owns `transform`, and that is the whole point of this file.**
 * The magnetic-link component this replaces wrapped the anchor in a motion span
 * that animated one transform while `whileHover` wrote a second on the anchor
 * inside it. Two composited layers re-rastering against each other on hover is
 * what made the button drop out of view, and the fix at the time was to strip
 * the motion out entirely and leave three hand-copied anchors behind.
 *
 * Here the anchor is the only transformed node: the scale lives on it, and the
 * arrow — the one child that also moves — moves on a CSS transition, which is a
 * separate property on a separate box and cannot fight it. `MotionConfig`
 * carries `reducedMotion="user"`, so the scale is dropped for a reader who asks
 * for that while the colour and shadow transitions stay.
 */
export function ActionLink({
  href,
  variant = "solid",
  className,
  children,
}: ActionLinkProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ transform: "scale(1.02)", transition: SPRING_SNAP }}
      whileTap={{ transform: "scale(0.985)", transition: SPRING_SNAP }}
      className={cn(
        "group inline-flex items-center justify-center gap-3 rounded-full font-medium tracking-tight",
        "transition-[background-color,border-color,box-shadow,color] duration-300 ease-out",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
      {/* Decoration — the label beside it already names the destination. */}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-strong motion-safe:group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
      </svg>
    </motion.a>
  );
}
