/**
 * Geometry for the site-wide duct run — the vertical spine that starts under the hero
 * and continues, unbroken, down to the footer.
 *
 * Orthogonal by construction: every stroke is either exactly vertical or exactly
 * horizontal, and every corner is a true right angle. That is the industrial read we
 * want, and it buys a real technical property for free — the segments are drawn with
 * `preserveAspectRatio="none"`, so the viewBox is stretched by a different factor on
 * each axis. A diagonal or a curve would shear under that. Axis-aligned lines cannot:
 * vertical stays vertical, horizontal stays horizontal, and 90° stays 90° on every
 * plate, whatever its height.
 *
 * Each plate renders one segment. A segment's exit coordinate is the next segment's
 * entry coordinate by construction, because both read `runX` at the same boundary
 * index — so the run stays continuous across plates without any section knowing
 * anything about its neighbours.
 */

/** Segment viewBox is square; the caller stretches it to the plate. */
export const RUN_VIEW = 1000;

export const RUN_LINES = 7;

/** Both ends overshoot the viewBox so plate seams never show a gap or a kink. */
const OVERSHOOT = 80;

/**
 * Routing grid. Snapping every x to it is what separates a drawn route from a sampled
 * one: risers line up with each other across the page instead of each landing on its
 * own arbitrary fraction of a pixel.
 */
const GRID = 25;
const snap = (value: number) => Math.round(value / GRID) * GRID;

const LANE = (RUN_VIEW - 160) / (RUN_LINES - 1);
const baseX = (line: number) => 80 + line * LANE;

/**
 * Kept below the lane spacing on purpose — a line wanders within its own lane and
 * never crosses its neighbour, which is what stops the run reading as tangled.
 */
const amplitude = (line: number) => 20 + ((line * 5) % 3) * 20;
const phase = (line: number) => line * 1.1;

/** Horizontal position of `line` at the boundary above `segment`. */
export function runX(segment: number, line: number) {
  return snap(baseX(line) + amplitude(line) * Math.sin(phase(line) + segment * 0.9));
}

/**
 * Height at which `line` makes its lateral move inside `segment`. Staggered per line
 * and per segment, or every jog would land at the same height and the whole family
 * would read as one horizontal bar drawn across the plate.
 */
function jogY(segment: number, line: number) {
  return 200 + ((line * 3 + segment * 2 + RUN_LINES * 4) % 5) * 130;
}

/** One line through one segment: drop, single lateral jog, drop. */
export function runPath(segment: number, line: number) {
  const from = runX(segment, line);
  const to = runX(segment + 1, line);
  const exit = RUN_VIEW + OVERSHOOT;

  // A run that does not move sideways in this segment is a straight riser, not a jog
  // with zero length — emitting the elbow anyway would leave a miter artefact.
  if (from === to) {
    return `M ${from} ${-OVERSHOOT} L ${from} ${exit}`;
  }

  const y = jogY(segment, line);
  return `M ${from} ${-OVERSHOOT} L ${from} ${y} L ${to} ${y} L ${to} ${exit}`;
}

/** Every third line is a primary riser — heavier, and brighter under the travelling head. */
export const isPrimaryLine = (line: number) => line % 3 === 1;
