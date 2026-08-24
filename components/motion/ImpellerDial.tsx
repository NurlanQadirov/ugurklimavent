import { cn } from "@/lib/utils";

const CENTER = 220;
const BLADE_COUNT = 9;

/**
 * One swept-back axial fan blade, drawn from the hub outward and back. Rotated
 * BLADE_COUNT times around the origin to form the rotor.
 */
const BLADE = "M 0 -36 C 46 -46 96 -80 126 -128 C 152 -86 120 -26 42 -12 Z";

/** 60 housing graduations, every fifth one major — the register of a commissioning dial. */
const TICKS = Array.from({ length: 60 }, (_, i) => i);

/**
 * An axial impeller drawn as a commissioning gauge: static housing and scale, a rotor
 * turning at working speed, and a trim ring creeping the other way.
 *
 * Rotation is constant, so the curve is linear — anything eased would read as a motor
 * stalling and restarting. It stays a server component: nothing here is interactive and
 * all of its motion is CSS, which keeps running while the page is still hydrating.
 */
export function ImpellerDial({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <svg viewBox="0 0 440 440" className="h-full w-full" role="presentation">
        <defs>
          <linearGradient id="impeller-blade" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.17" />
            <stop offset="1" stopColor="var(--color-volt)" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="impeller-hub">
            <stop offset="0" stopColor="var(--color-volt)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--color-volt)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Housing */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="206"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.07"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="178"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.05"
        />

        <g stroke="#fff" strokeOpacity="0.14">
          {TICKS.map((i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1={CENTER}
                y1="22"
                x2={CENTER}
                y2={major ? 40 : 32}
                strokeWidth={major ? 1.4 : 0.8}
                transform={`rotate(${i * 6} ${CENTER} ${CENTER})`}
              />
            );
          })}
        </g>

        <circle
          className="impeller-part animate-impeller-reverse"
          cx={CENTER}
          cy={CENTER}
          r="196"
          fill="none"
          stroke="var(--color-volt)"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="2 16"
          strokeLinecap="round"
        />

        {/*
          Rotor. The CSS animation owns the outer group's transform, so the centring
          translate has to live on a separate element or it would be overwritten.
        */}
        <g className="impeller-part animate-impeller">
          <g transform={`translate(${CENTER} ${CENTER})`}>
            {Array.from({ length: BLADE_COUNT }, (_, i) => (
              <path
                key={i}
                d={BLADE}
                fill="url(#impeller-blade)"
                stroke="#fff"
                strokeOpacity="0.09"
                transform={`rotate(${(360 / BLADE_COUNT) * i})`}
              />
            ))}
          </g>
        </g>

        <circle cx={CENTER} cy={CENTER} r="54" fill="url(#impeller-hub)" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="34"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
        />
      </svg>
    </div>
  );
}
