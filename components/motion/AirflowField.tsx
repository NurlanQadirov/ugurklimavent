import { cn } from "@/lib/utils";

/**
 * Nine laminar streamlines across a 1600 x 900 field. Alternating bend direction with a
 * shrinking amplitude toward the exit gives the family the look of a CFD plot — flow
 * disturbed on entry that settles as it leaves — rather than nine parallel squiggles.
 *
 * These curve where the duct run below turns at right angles, and the distinction is
 * deliberate: the ductwork is fabricated, so it has elbows; the air moving through it is
 * not, so it does not. The bend is kept shallow so the field still reads as laminar.
 */
const STREAMLINES = Array.from({ length: 9 }, (_, i) => {
  const y = 40 + i * 105;
  const bend = (i % 2 === 0 ? -1 : 1) * (18 + (i % 3) * 10);
  return `M -160 ${y} C 240 ${y + bend} 580 ${y - bend} 920 ${y + bend * 0.55} S 1420 ${y - bend * 0.85} 1780 ${y - bend * 0.25}`;
});

/** Every third line is the primary run — heavier stroke, brighter in the mask. */
const isPrimary = (i: number) => i % 3 === 1;

const SWEEPS = [
  {
    id: "volt",
    color: "var(--color-volt)",
    peak: 0.8,
    width: 560,
    animation: "animate-flow-a",
  },
  // The white pass is the one that has to be quietest: at equal alpha it buys far more
  // contrast against near-black than the blues do, and it crosses the headline.
  {
    id: "white",
    color: "#ffffff",
    peak: 0.42,
    width: 400,
    animation: "animate-flow-b",
  },
  {
    id: "deep",
    color: "var(--color-volt-deep)",
    peak: 0.7,
    width: 300,
    animation: "animate-flow-c",
  },
] as const;

/**
 * The airflow visualisation behind the fold: a static streamline field with pulses of
 * light travelling along it, left to right. The pulses are plain gradient rects
 * translating across; an SVG mask built from the same streamline paths is what confines
 * them to the lines. Nothing repaints — each band is a single composited transform.
 */
export function AirflowField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none overflow-hidden", className)}
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        <defs>
          {SWEEPS.map((sweep) => (
            <linearGradient
              key={sweep.id}
              id={`airflow-pulse-${sweep.id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor={sweep.color} stopOpacity="0" />
              <stop offset="0.5" stopColor={sweep.color} stopOpacity={sweep.peak} />
              <stop offset="1" stopColor={sweep.color} stopOpacity="0" />
            </linearGradient>
          ))}

          {/*
            userSpaceOnUse, sized well past the field: the default objectBoundingBox
            region would be derived from the sweep rects' untransformed bounds and would
            clip them the moment they translate out of it.
          */}
          <mask
            id="airflow-mask"
            maskUnits="userSpaceOnUse"
            x="-260"
            y="-260"
            width="2120"
            height="1420"
          >
            <g fill="none" stroke="#fff" strokeLinecap="round">
              {STREAMLINES.map((d, i) => (
                <g key={d}>
                  {/* Halo pass — widens the pulse into a glow around the line. */}
                  <path
                    d={d}
                    strokeWidth={isPrimary(i) ? 14 : 9}
                    strokeOpacity="0.2"
                  />
                  {/* Core pass — the line itself, at full luminance. */}
                  <path
                    d={d}
                    strokeWidth={isPrimary(i) ? 3.2 : 1.8}
                    strokeOpacity="1"
                  />
                </g>
              ))}
            </g>
          </mask>
        </defs>

        {/* Resting field — visible at all times, and the whole effect under reduced motion. */}
        <g fill="none" stroke="#fff" strokeLinecap="round" opacity="0.055">
          {STREAMLINES.map((d, i) => (
            <path key={d} d={d} strokeWidth={isPrimary(i) ? 2.4 : 1.4} />
          ))}
        </g>

        <g mask="url(#airflow-mask)">
          {SWEEPS.map((sweep) => (
            <rect
              key={sweep.id}
              className={cn("airflow-sweep", sweep.animation)}
              x="0"
              y="-40"
              width={sweep.width}
              height="980"
              fill={`url(#airflow-pulse-${sweep.id})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
