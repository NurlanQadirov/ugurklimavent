"use client";

import { Fragment, useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import { FlowRun } from "@/components/motion/FlowRun";
import { riseChild, staggerParent } from "@/components/motion/tokens";
import { useDictionary } from "@/i18n/DictionaryProvider";

/**
 * The fold's still plate. It stands in for the video on phones — where the
 * 2.4 MB file is the single heaviest thing on the page — and on any screen
 * whose reader has asked for reduced motion.
 *
 * Drop the file in `public/` under exactly this name. A different format means
 * changing this one line and nothing else.
 */
const MOBILE_HERO_IMAGE = "/mobile-hero-bg.webp";

/**
 * Type reveal: each line rides up from behind its own clipped box.
 * The percentage translate is relative to the line's own height, so it stays
 * correct at every breakpoint without a magic pixel value.
 */
const lineChild: Variants = {
  hidden: { opacity: 0, transform: "translateY(110%)" },
  visible: {
    opacity: 1,
    transform: "translateY(0%)",
    transition: { type: "spring", duration: 1.05, bounce: 0.14 },
  },
};

export function Hero() {
  const { hero } = useDictionary();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * Whether the video file is fetched at all is decided here, not by the
   * browser. Two things had to change together for that:
   *
   * `autoPlay` is gone and `preload` is `none`, because a `<video>` that is
   * only hidden with CSS still honours `preload` — and `autoPlay` overrides it
   * outright, which is how the full 2.4 MB was landing on phones even with
   * `preload="metadata"` set. Nothing is requested now until `play()` is
   * called, and `play()` is called only on the screens that show the video.
   *
   * So a phone downloads the still image and never touches the video, and a
   * reader who has asked for reduced motion gets the same still at any width
   * rather than a paused first frame. The classes on the two plates below
   * mirror this exactly; the pair has to stay in step.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      if (wide.matches && !still.matches) void video.play().catch(() => {});
      else video.pause();
    };

    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  // Progress from "hero fills the viewport" to "hero has fully left the top".
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The fold recedes rather than scrolling away: it drifts up at less than page
  // speed, shrinks a hair and dissolves, so the section below arrives over it.
  const drift = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  // Stated across the full 0–1 domain rather than [0, 0.72] plus clamping:
  // Motion can hand a scroll-linked opacity to the compositor, and the native
  // timeline it generates does not honour the clamp — past the last stop the
  // value mirrors back and the hero fades *in* again on its way out.
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0, 0]);
  const transform = useMotionTemplate`translate3d(0px, ${drift}px, 0) scale(${scale})`;

  return (
    /*
     * `aria-labelledby` on the section rather than an `aria-label`: the fold is
     * a landmark, and pointing it at the `<h1>` that is already on screen names
     * it with the page's own words instead of a second string that has to be
     * translated and kept in sync.
     */
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-heading"
      className="gutter grain relative flex min-h-[100svh] scroll-mt-24 flex-col overflow-hidden pb-8 pt-24 sm:pt-28"
    >
      {/*
        Backdrop. It shares the fold's fade but not its drift or scale, so the two
        planes separate as the page moves instead of leaving as one flat sheet.
      */}
      <motion.div
        aria-hidden
        style={{ opacity }}
        className="absolute inset-0 motion-reduce:opacity-100!"
      >
        {/*
          The still plate: phones, and reduced motion at any width. `alt=""`
          rather than a description — it is decoration, and the wrapper is
          already `aria-hidden`. `opacity-45` matches the video exactly, so the
          washes below sit on the same tone whichever plate is showing.
        */}
        {/*
          A plain `<img>`, not `next/image`. The optimizer's job is to pick a
          size and a format for a photo whose display size it can infer; this
          one is full-bleed decoration behind a dark wash, already served in the
          format it was exported in, and `fill` would only add a server-side
          transform to every cold request for no visible gain.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MOBILE_HERO_IMAGE}
          alt=""
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover opacity-45 md:hidden motion-reduce:md:block"
        />

        {/*
          The video plate — the backdrop on desktop now that the generated
          airflow field and rotor have been removed, so it carries the whole
          plane on its own.

          `muted` + `playsInline` are what make `play()` succeed: every current
          browser blocks unmuted playback started without a click, and iOS
          Safari takes an un-`playsInline` video fullscreen instead of playing
          it in place. It carries no audio track and no controls, so it is
          decoration — `aria-hidden` on the wrapper keeps it out of the a11y
          tree. See the effect above for why `autoPlay` is absent.
        */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 hidden h-full w-full object-cover opacity-45 md:block motion-reduce:md:hidden"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/*
          Holds the headline's contrast over whatever frame is on screen. The
          radial wash below shapes the left column; this is the flat floor under
          it, so a bright cut in the footage cannot wash the type out.
        */}
        <div className="absolute inset-0 bg-void/60" />

        {/*
          Shapes the left column, where the copy sits, darker than the rest.
          Mixed in the page's own ground colour rather than a hand-written
          `rgba(5, 5, 5, …)`: the wash has to dissolve into the section below it
          without a seam, and it cannot do that against a value that was already
          two points off the body background and is now three.
        */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_90%_at_16%_50%,rgba(9,9,11,0.92),rgba(9,9,11,0.55)_52%,transparent_78%)]" />
      </motion.div>

      {/*
        Where the intake turns down: segment -1 of the site-wide duct run, which
        continues through every section below without a break — see lib/airflow.ts.
        It is deliberately left out of the fade, because the one place the continuity
        has to stay legible is exactly where it leaves the plate.
      */}
      <FlowRun
        segment={-1}
        className="absolute inset-x-0 bottom-0 h-[46%] opacity-70"
      />

      {/* Everything in the fold recedes together, meta row included. */}
      <motion.div
        style={{ transform, opacity }}
        className="flex flex-1 flex-col motion-reduce:transform-none! motion-reduce:opacity-100!"
      >
        {/*
         * `flex-1` centres the copy in whatever height is left over and the
         * meta row keeps its place in normal flow — positioning that row
         * absolutely would drop it on top of the call to action the moment the
         * headline wrapped to a fourth line.
         */}
        <div className="flex w-full flex-1 items-center">
          <motion.div
            variants={staggerParent(0.08, 0.15)}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl"
          >
            <motion.h1
              id="hero-heading"
              variants={staggerParent(0.09)}
              className="max-w-5xl text-[clamp(2.5rem,min(8vw,10.5svh),7.5rem)] font-medium leading-[1.1] tracking-tight text-white"
            >
              {hero.headingLines.map((line, i) => (
                <Fragment key={i}>
                  {/*
                    A real space between the lines. The clip boxes are block
                    elements, so this collapses to nothing on screen — but the
                    lines are otherwise three adjacent text runs with no
                    separator, and a text extractor that flattens the element
                    reads the site's most important string as
                    "EngineeredClimate &Safety Solutions". `HeadingLines` avoids
                    this with a real `<br />`; the hero could not, because each
                    line needs its own overflow box for the reveal.
                  */}
                  {i > 0 ? " " : null}
                  <span className="block overflow-hidden pb-[0.02em]">
                    <motion.span variants={lineChild} className="block">
                      {line}
                    </motion.span>
                  </span>
                </Fragment>
              ))}
            </motion.h1>

            <motion.p
              variants={riseChild}
              className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-ink sm:text-lg"
            >
              {hero.lede}
            </motion.p>

            <motion.div variants={riseChild} className="mt-10">
              {/*
                Written out here, not shared with the navbar and footer. The
                shared version scaled the anchor with a Motion hover transform,
                and inside this fold — itself a transformed, scroll-faded layer —
                that transform made the button drop out of view under the
                pointer. Hover changes the shadow only, which never promotes the
                anchor to a layer of its own.
              */}
              <a href="#contact" className="bloom group inline-flex items-center justify-center gap-3 rounded-full bg-porcelain px-7 py-3.5 text-sm font-medium tracking-tight text-void transition-shadow duration-300 ease-out">
                {hero.cta}
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
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Technical meta — the drawing sheet's corner stamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none flex w-full shrink-0 items-end justify-end pt-10"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            {hero.coordinates}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
