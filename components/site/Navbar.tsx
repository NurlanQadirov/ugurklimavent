"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "framer-motion";

import {
  useCompany,
  useDictionary,
  useLocale,
} from "@/i18n/DictionaryProvider";
import {
  SPRING_ENTRANCE,
  riseChildTight,
  staggerParent,
} from "@/components/motion/tokens";
import { ActionLink } from "./ActionLink";
import { BrandLogo } from "./BrandLogo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";

const linkClassName =
  "rounded-full px-4 py-2 text-[13px] text-white/50 transition-colors duration-200 ease-out-strong hover:text-white";

/**
 * The bar "shrinks" via `scale` rather than height or padding: scale is
 * composited, height is not, and this runs on every scroll frame.
 *
 * The fills are written out as literal `rgba()` and not as `var(--color-carbon)`
 * because Motion interpolates between the two states and cannot interpolate a
 * custom property. That makes them the one place on the site where a surface
 * colour is duplicated by hand — so they have to be updated with the token, and
 * `rgba(14, 14, 16, …)` is `--color-carbon` written out.
 */
const shell: Variants = {
  top: {
    transform: "translateY(0px) scale(1)",
    backgroundColor: "rgba(14, 14, 16, 0)",
    borderColor: "rgba(255, 255, 255, 0)",
    boxShadow: "0 1px 0 0 rgba(255,255,255,0) inset, 0 20px 48px -24px rgba(0,0,0,0)",
    transition: { type: "spring", duration: 0.5, bounce: 0.12 },
  },
  compact: {
    transform: "translateY(-6px) scale(0.94)",
    backgroundColor: "rgba(14, 14, 16, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    // The bar only casts a shadow once it is a panel over content. At the top
    // of the page it is floating on the fold and there is nothing to cast onto.
    boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 48px -24px rgba(0,0,0,0.9)",
    transition: { type: "spring", duration: 0.5, bounce: 0.12 },
  },
};

export function Navbar() {
  const dict = useDictionary();
  const locale = useLocale();
  const COMPANY = useCompany();
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  // Threshold crossing only — this must not re-render on every frame.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 24;
    setCompact((current) => (current === next ? current : next));
  });

  return (
    <motion.header
      initial={{ opacity: 0, transform: "translateY(-24px) scale(1)" }}
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      transition={{ ...SPRING_ENTRANCE, delay: 0.1 }}
      className="gutter fixed inset-x-0 top-0 z-50 pt-4 sm:pt-5"
    >
      {/*
        Two `<nav>` elements are rendered on every page — this one and the
        locale switcher — so both need a name. Without `aria-label` a screen
        reader announces "navigation" twice with nothing to tell them apart,
        and neither is usable from the landmarks menu.
      */}
      <motion.nav
        aria-label={dict.a11y.primaryNav}
        variants={shell}
        animate={compact ? "compact" : "top"}
        className="flex items-center justify-between gap-4 rounded-full border px-4 py-2.5 backdrop-blur-xl sm:-mx-5 sm:px-5"
      >
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 text-white"
          aria-label={`${COMPANY.name} — ${dict.nav.backToTop}`}
        >
          <BrandLogo />
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-medium tracking-tight text-white">
              Uğur Klima Vent
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
              MMC
            </span>
          </span>
        </Link>

        <motion.ul
          variants={staggerParent(0.05, 0.35)}
          initial="hidden"
          animate="visible"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <motion.li key={link.href} variants={riseChildTight}>
              {link.href.startsWith("#") ? (
                <a href={link.href} className={linkClassName}>
                  {dict.nav.links[link.key]}
                </a>
              ) : (
                <Link href={`/${locale}${link.href}`} className={linkClassName}>
                  {dict.nav.links[link.key]}
                </Link>
              )}
            </motion.li>
          ))}
        </motion.ul>

        {/*
          Language and the call to action travel together on the right — and,
          like the link list, only from `lg` up. Below that they are rendered
          inside `MobileMenu`, which is the layer that has room for them.
        */}
        <div className="hidden items-center gap-3 sm:gap-4 lg:flex">
          <LocaleSwitcher />

          {/*
            A plain anchor rather than `Link`: `#contact` is the footer, which
            the layout renders on every route, so this never leaves the
            document. It is the same `ActionLink` the hero and footer use, in
            the quieter of its two weights — the bar must not out-weigh the
            solid button further down the page.
          */}
          <ActionLink href="#contact" variant="ghost">
            {dict.nav.cta}
          </ActionLink>
        </div>

        <MobileMenu />
      </motion.nav>
    </motion.header>
  );
}
