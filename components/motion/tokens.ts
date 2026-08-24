import type { Transition, Variants } from "framer-motion";

/**
 * Motion vocabulary for the whole site.
 *
 * Every animated property is `transform` (as a full string, which stays
 * hardware accelerated — the `x`/`y`/`scale` shorthands do not) or `opacity`.
 * Structures inside a variant pair are kept identical so Motion can
 * interpolate the transform string numerically.
 */

/** Cinematic entrances — marketing tier, so it may breathe past the 300ms UI ceiling. */
export const SPRING_ENTRANCE: Transition = {
  type: "spring",
  duration: 0.9,
  bounce: 0.16,
};

/** Interaction feedback — must feel instant. */
export const SPRING_SNAP: Transition = {
  type: "spring",
  duration: 0.32,
  bounce: 0.08,
};

/** Cursor-follow physics for magnetic elements. */
export const SPRING_MAGNET = {
  stiffness: 260,
  damping: 26,
  mass: 0.6,
} as const;

/** Parallax smoothing — heavier, so the backdrop lags the foreground. */
export const SPRING_PARALLAX = {
  stiffness: 90,
  damping: 30,
  mass: 0.9,
} as const;

export const staggerParent = (
  staggerChildren = 0.06,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const riseChild: Variants = {
  hidden: { opacity: 0, transform: "translateY(40px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: SPRING_ENTRANCE,
  },
};

/** Slightly shorter travel, for dense groups like tag rows and nav links. */
export const riseChildTight: Variants = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: SPRING_ENTRANCE,
  },
};

/** Bento cards: rise and settle out of a very slight recess. */
export const cardChild: Variants = {
  hidden: { opacity: 0, transform: "translateY(48px) scale(0.97)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: SPRING_ENTRANCE,
  },
};

export const VIEWPORT = { once: true, margin: "-80px" } as const;
