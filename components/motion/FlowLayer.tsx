"use client";

import { FlowRun } from "./FlowRun";

/**
 * Drops one segment of the duct run behind a section's content.
 *
 * Full-bleed on purpose. Several of our sections are `mx-auto max-w-6xl`, and a run
 * confined to that shell would step inward at every seam — the continuity across plates
 * only reads if every segment is measured against the same width. `left-1/2` plus a half
 * translate re-centres a viewport-wide layer inside a narrower parent; `body` clips the
 * overflow.
 *
 * The section it sits in must carry `isolate`, so the negative z-index resolves against
 * that section rather than escaping behind the page backdrop.
 *
 * Hidden below `md`. The run is a scroll-linked SVG per section — seven of them
 * on the home page, each with its own mask and `useScroll` subscription — and on
 * a phone it is both the least visible thing on the page and the most expensive.
 * `hidden` keeps it out of layout and paint entirely rather than just fading it.
 */
export function FlowLayer({ segment }: { segment: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-screen -translate-x-1/2 md:block"
    >
      <FlowRun segment={segment} className="absolute inset-0" />
    </div>
  );
}
