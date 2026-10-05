"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useDictionary, useLocale } from "@/i18n/DictionaryProvider";
import type { Locale } from "@/i18n/config";
import { FlowLayer } from "@/components/motion/FlowLayer";
import { HudTag } from "@/components/motion/HudTag";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { HeadingLines } from "./HeadingLines";

/* -------------------------------------------------------------------------- */
/* The model                                                                   */
/* -------------------------------------------------------------------------- */

type BuildingType = "industrial" | "retail" | "office" | "hotel";
type SystemKey = "split" | "vrf" | "chiller" | "plant" | "industrial";

/**
 * Rule-of-thumb design figures for Baku's climate (hot, humid summers, ~35°C
 * design dry bulb). `ach` is air changes per hour for general ventilation;
 * `wPerM2` is the sensible-plus-latent cooling load per square metre of floor
 * at a 3 m ceiling. These are the numbers an engineer uses to sanity-check a
 * budget before a survey — the copy says so, in all three languages.
 */
const PROFILES: Record<BuildingType, { ach: number; wPerM2: number }> = {
  industrial: { ach: 8, wPerM2: 130 },
  retail: { ach: 6, wPerM2: 150 },
  office: { ach: 5, wPerM2: 110 },
  hotel: { ach: 4, wPerM2: 95 },
};
const TYPES = Object.keys(PROFILES) as BuildingType[];

/** Taller rooms carry more envelope and stratified air: +7% per metre over 3 m. */
const heightFactor = (h: number) => 1 + 0.07 * Math.max(0, h - 3);

function estimate(area: number, height: number, type: BuildingType) {
  const { ach, wPerM2 } = PROFILES[type];
  const volume = area * height;
  const airflow = volume * ach;
  const kw = (area * wPerM2 * heightFactor(height)) / 1000;

  let system: SystemKey;
  if (type === "industrial" && kw >= 20) system = "industrial";
  else if (kw < 35) system = "split";
  else if (kw < 250) system = "vrf";
  else if (kw < 900) system = "chiller";
  else system = "plant";

  return { ach, wPerM2, volume, airflow, kw, system };
}

/* -------------------------------------------------------------------------- */
/* Slider scales                                                               */
/* -------------------------------------------------------------------------- */

const AREA_MIN = 30;
const AREA_MAX = 30000;
const STEPS = 1000;

/**
 * Area is on a log scale. A linear 30–30 000 m² slider puts every office floor
 * a reader is likely to try into its first 3% of travel; logarithmic, a 200 m²
 * suite and a 20 000 m² mall are both a comfortable thumb's width apart.
 */
const areaFromPos = (pos: number) => {
  const raw = AREA_MIN * (AREA_MAX / AREA_MIN) ** (pos / STEPS);
  const step = raw < 200 ? 5 : raw < 1000 ? 10 : raw < 5000 ? 50 : 100;
  return Math.round(raw / step) * step;
};
const posFromArea = (area: number) =>
  Math.round((Math.log(area / AREA_MIN) / Math.log(AREA_MAX / AREA_MIN)) * STEPS);

const HEIGHT_MIN = 2.4;
const HEIGHT_MAX = 14;

/** Gauge scale: log from 1 kW to 5 MW. */
const GAUGE_MAX = 5000;
const gaugeFraction = (kw: number) =>
  Math.min(1, Math.max(0, Math.log10(Math.max(1, kw)) / Math.log10(GAUGE_MAX)));

/**
 * Number formatting, by hand.
 *
 * `Intl.NumberFormat("az-AZ")` is the obvious tool and it breaks hydration:
 * Node and the browser ship different ICU data, so the server rendered
 * "1,200" and the client "1.200" for the same value. The three locales only
 * need a group and a decimal separator, so they are stated here and render
 * identically on both sides.
 */
const SEPARATORS: Record<Locale, { group: string; decimal: string }> = {
  az: { group: ".", decimal: "," },
  en: { group: ",", decimal: "." },
  ru: { group: "\u00a0", decimal: "," },
};

function formatNumber(n: number, locale: Locale, decimals = 0) {
  const { group, decimal } = SEPARATORS[locale];
  const [int, frac] = Math.abs(n).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${n < 0 ? "-" : ""}${grouped}${frac ? decimal + frac : ""}`;
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A number that springs to its new value. Written straight to `textContent`
 * on each animation frame, so dragging a slider never re-renders the card.
 */
function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);

  useEffect(() => {
    const controls = animate(current.current, value, {
      type: "spring",
      duration: 0.6,
      bounce: 0,
      onUpdate: (latest) => {
        current.current = latest;
        if (ref.current) ref.current.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [value, format]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

const ARC_START = -120;
const ARC_SWEEP = 240;
const R = 92;

// Rounded to 0.01: unrounded trig differs in the last digit between Node and
// the browser, and React reports every such attribute as a hydration mismatch.
const round2 = (n: number) => Math.round(n * 100) / 100;
const polar = (deg: number, r = R) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [round2(100 + r * Math.cos(a)), round2(100 + r * Math.sin(a))] as const;
};
const ARC_PATH = (() => {
  const [x0, y0] = polar(ARC_START);
  const [x1, y1] = polar(ARC_START + ARC_SWEEP);
  return `M ${x0} ${y0} A ${R} ${R} 0 1 1 ${x1} ${y1}`;
})();

/** The cooling gauge: a 240° log arc with a sprung needle. */
function Gauge({ kw, label }: { kw: number; label: string }) {
  const target = useMotionValue(gaugeFraction(kw));
  const fraction = useSpring(target, { stiffness: 140, damping: 22, mass: 0.6 });
  useEffect(() => target.set(gaugeFraction(kw)), [kw, target]);

  const needle = useMotionTemplate`rotate(${useTransform(fraction, (f) => ARC_START + f * ARC_SWEEP)}deg)`;
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, "");

  // Decades on the log scale: 1, 10, 100, 1 000 kW.
  const decades = [1, 10, 100, 1000];

  return (
    <svg viewBox="0 0 200 172" role="img" aria-label={label} className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`g-${gradientId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgb(var(--hud-ink))" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="rgb(var(--hud-ink))" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Minor graduations */}
      <g stroke="#fff" strokeOpacity="0.14">
        {Array.from({ length: 41 }, (_, i) => {
          const deg = ARC_START + (i / 40) * ARC_SWEEP;
          const [x0, y0] = polar(deg, 80);
          const [x1, y1] = polar(deg, i % 5 === 0 ? 72 : 76);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} />;
        })}
      </g>
      {decades.map((d) => {
        const deg = ARC_START + gaugeFraction(d) * ARC_SWEEP;
        const [x, y] = polar(deg, 60);
        return (
          <text
            key={d}
            x={x}
            y={y + 3}
            textAnchor="middle"
            fontSize="7"
            fontFamily="var(--font-mono)"
            fill="#fff"
            fillOpacity="0.45"
          >
            {d >= 1000 ? `${d / 1000}k` : d}
          </text>
        );
      })}

      <path d={ARC_PATH} fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="6" strokeLinecap="round" />
      <motion.path
        d={ARC_PATH}
        fill="none"
        stroke={`url(#g-${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        style={{ pathLength: fraction }}
      />

      {/* Needle — a rotated group, so the motion is a transform. */}
      <motion.g style={{ transform: needle, transformOrigin: "100px 100px", transformBox: "view-box" }}>
        <line x1="100" y1="100" x2="100" y2="28" stroke="rgb(var(--hud-ink))" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="100" cy="28" r="2.5" fill="rgb(var(--hud-ink))" />
      </motion.g>
      <circle cx="100" cy="100" r="7" fill="#09090b" stroke="rgb(var(--hud-ink))" strokeOpacity="0.6" />
      <text x="100" y="140" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="#fff" fillOpacity="0.4" letterSpacing="1.5">
        kW · LOG
      </text>
    </svg>
  );
}

/** Mini plan of the recommended system — five tiny line drawings. */
function SystemGlyph({ system }: { system: SystemKey }) {
  const common = {
    fill: "none",
    stroke: "rgb(var(--hud-ink))",
    strokeWidth: 1.2,
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] as const },
  };
  const paths: Record<SystemKey, string[]> = {
    split: ["M6 14h28v10H6z", "M10 19h20", "M20 24v8", "M14 32h12"],
    vrf: ["M4 6h14v10H4z", "M11 16v8h22", "M22 24v6", "M33 24v6", "M18 30h8v4h-8z", "M29 30h8v4h-8z"],
    chiller: ["M4 8h16v14H4z", "M8 12h8M8 16h8", "M20 15h16", "M28 15v12", "M24 27h8v5h-8z"],
    plant: ["M2 6h12v12H2z", "M16 6h12v12H16z", "M8 18v8h28", "M22 18v8", "M30 2h8v8h-8z", "M34 10v16"],
    industrial: ["M4 10h20v12H4z", "M24 16h12", "M30 10v-6", "M26 4h8", "M10 22v8h16"],
  };
  return (
    <svg viewBox="0 0 40 36" className="h-9 w-10 shrink-0" aria-hidden>
      {paths[system].map((d, i) => (
        <motion.path key={`${system}-${i}`} d={d} {...common} transition={{ ...common.transition, delay: i * 0.06 }} />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

export function HVACLoadCalculator() {
  const dict = useDictionary();
  const { calculator: copy } = dict;
  const locale = useLocale();
  const ids = useId();

  const [areaPos, setAreaPos] = useState(() => posFromArea(1200));
  const [height, setHeight] = useState(3.2);
  const [type, setType] = useState<BuildingType>("office");

  const area = areaFromPos(areaPos);
  const result = estimate(area, height, type);

  // Stable identities: `AnimatedNumber` restarts its spring when `format` changes.
  const fmt = useMemo(
    () => ({
      int: (n: number) => formatNumber(n, locale),
      one: (n: number) => formatNumber(n, locale, 1),
      airflow: (n: number) => formatNumber(Math.round(n / 10) * 10, locale),
      kw: (n: number) => formatNumber(n, locale, n < 100 ? 1 : 0),
    }),
    [locale],
  );

  const areaFill = `${(areaPos / STEPS) * 100}%`;
  const heightFill = `${((height - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN)) * 100}%`;

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-heading"
      className="section-y relative isolate mx-auto w-full max-w-6xl scroll-mt-24 px-6 sm:px-8"
    >
      <FlowLayer segment={3} />
      <HudTag
        label={`[CALC // ACH ${result.ach} · q ${result.wPerM2} W/m² · Δt 35°C]`}
        className="right-6 top-16 sm:right-8"
      />

      <Reveal className="mb-14 flex flex-col gap-8 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealItem className="mb-6 flex items-center gap-3">
            <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
              {copy.eyebrow}
            </span>
          </RevealItem>
          <RevealItem>
            <h2
              id="calculator-heading"
              className="max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-medium leading-[1.1] tracking-tight text-white"
            >
              <HeadingLines lines={copy.headingLines} />
            </h2>
          </RevealItem>
        </div>
        <RevealItem className="max-w-sm">
          <p className="text-pretty text-sm leading-relaxed text-ink">{copy.lede}</p>
        </RevealItem>
      </Reveal>

      <Reveal>
        <RevealItem className="lift relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {/* Drawing-sheet grid behind the instrument. */}
          <div aria-hidden className="blueprint-mesh-fine pointer-events-none absolute inset-0 -z-10 opacity-80" />
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

          <div className="grid lg:grid-cols-12">
            {/* Inputs */}
            <div className="flex flex-col gap-10 border-b border-white/[0.05] p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <div>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <label htmlFor={`${ids}-area`} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {copy.area}
                  </label>
                  <output htmlFor={`${ids}-area`} className="font-mono text-sm tabular-nums text-white">
                    {fmt.int(area)} m²
                  </output>
                </div>
                <input
                  id={`${ids}-area`}
                  type="range"
                  min={0}
                  max={STEPS}
                  value={areaPos}
                  aria-valuetext={`${fmt.int(area)} m²`}
                  onChange={(e) => setAreaPos(Number(e.target.value))}
                  className="hud-range w-full"
                  style={{ "--fill": areaFill } as CSSProperties}
                />
                <div aria-hidden className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.14em] text-white/50">
                  {[30, 300, 3000, 30000].map((tick) => (
                    <span key={tick}>{fmt.int(tick)}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <label htmlFor={`${ids}-height`} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {copy.height}
                  </label>
                  <output htmlFor={`${ids}-height`} className="font-mono text-sm tabular-nums text-white">
                    {fmt.one(height)} m
                  </output>
                </div>
                <input
                  id={`${ids}-height`}
                  type="range"
                  min={HEIGHT_MIN}
                  max={HEIGHT_MAX}
                  step={0.1}
                  value={height}
                  aria-valuetext={`${fmt.one(height)} m`}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="hud-range w-full"
                  style={{ "--fill": heightFill } as CSSProperties}
                />
                <div aria-hidden className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.14em] text-white/50">
                  <span>{fmt.one(HEIGHT_MIN)}</span>
                  <span>{HEIGHT_MAX}</span>
                </div>
              </div>

              <fieldset>
                <legend className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {copy.type}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => {
                    const on = t === type;
                    return (
                      <label
                        key={t}
                        className={cn(
                          "relative flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-porcelain",
                          on
                            ? "border-[rgb(var(--hud-ink)/0.5)] bg-[rgb(var(--hud-ink)/0.08)] text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-white/55 hover:border-white/15 hover:text-white/80",
                        )}
                      >
                        <input
                          type="radio"
                          name={`${ids}-type`}
                          value={t}
                          checked={on}
                          onChange={() => setType(t)}
                          className="sr-only"
                        />
                        <span aria-hidden>[</span>
                        <span className="px-1">{copy.types[t]}</span>
                        <span aria-hidden>]</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {/* Readout */}
            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 lg:col-span-7">
              <div className="flex flex-col items-center justify-center">
                <div className="aspect-[200/172] w-full max-w-[280px]">
                  <Gauge kw={result.kw} label={copy.gauge} />
                </div>
                <p className="-mt-6 text-center">
                  <span className="block text-[clamp(2rem,4vw,2.75rem)] font-medium leading-none tracking-tighter text-white">
                    <AnimatedNumber value={result.kw} format={fmt.kw} className="tabular-nums" />
                    <span className="ml-1.5 text-base text-white/55">kW</span>
                  </span>
                  <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                    {copy.cooling}
                  </span>
                </p>
              </div>

              <div className="flex flex-col justify-between gap-6">
                <dl className="divide-y divide-white/[0.05] border-y border-white/[0.05]">
                  <div className="py-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{copy.airflow}</dt>
                    <dd className="mt-1.5 text-2xl font-medium tracking-tight text-white">
                      <AnimatedNumber value={result.airflow} format={fmt.airflow} className="tabular-nums" />
                      <span className="ml-1.5 text-sm text-white/55">m³/h</span>
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{copy.volume}</dt>
                      <dd className="mt-1.5 text-base tabular-nums text-white">
                        <AnimatedNumber value={result.volume} format={fmt.int} />
                        <span className="ml-1 text-xs text-white/55">m³</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{copy.airChanges}</dt>
                      <dd className="mt-1.5 text-base tabular-nums text-white">
                        {result.ach}
                        <span className="ml-1 text-xs text-white/55">{copy.unitAch}</span>
                      </dd>
                    </div>
                  </div>
                </dl>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{copy.system}</p>
                  <div className="mt-3 flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <SystemGlyph key={`glyph-${result.system}`} system={result.system} />
                    <motion.p
                      key={`text-${result.system}`}
                      initial={{ opacity: 0, transform: "translateY(6px)" }}
                      animate={{ opacity: 1, transform: "translateY(0px)" }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      aria-live="polite"
                      className="text-pretty text-sm leading-relaxed text-white"
                    >
                      {copy.systems[result.system]}
                    </motion.p>
                  </div>
                </div>

                <a
                  href="#contact"
                  className="bloom group inline-flex items-center justify-center gap-3 self-start rounded-full bg-porcelain px-6 py-3 text-sm font-medium tracking-tight text-void transition-shadow duration-300 ease-out"
                >
                  {dict.hero.cta}
                  <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-strong motion-safe:group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="border-t border-white/[0.05] px-6 py-4 text-pretty text-[12px] leading-relaxed text-ink-dim sm:px-8">
            {copy.note}
          </p>
        </RevealItem>
      </Reveal>
    </section>
  );
}
