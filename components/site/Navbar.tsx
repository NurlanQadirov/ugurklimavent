"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, type Variants } from "framer-motion";

import { COMPANY } from "@/lib/content";
import { useDictionary, useLocale } from "@/i18n/DictionaryProvider";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { SPRING_ENTRANCE, riseChildTight, staggerParent } from "@/components/motion/tokens";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";

/**
 * Order and targets are structural; only the labels are translated. Routes are
 * locale-relative — a leading `#` stays an in-page anchor (only "contact"
 * does, since the footer it targets is mounted on every page), anything else
 * is prefixed with the active locale and resolved through `next/link`.
 */
const LINKS = [
  { key: "expertise", href: "/expertise" },
  { key: "process", href: "/process" },
  { key: "sectors", href: "/sectors" },
  { key: "contact", href: "#contact" },
] as const;

const linkClassName =
  "rounded-full px-4 py-2 text-[13px] text-white/55 transition-colors duration-200 ease-out-strong hover:text-white";

/**
 * The bar "shrinks" via `scale` rather than height or padding: scale is
 * composited, height is not, and this runs on every scroll frame.
 */
const shell: Variants = {
  top: {
    transform: "translateY(0px) scale(1)",
    backgroundColor: "rgba(8, 8, 10, 0)",
    borderColor: "rgba(255, 255, 255, 0)",
    transition: { type: "spring", duration: 0.5, bounce: 0.12 },
  },
  compact: {
    transform: "translateY(-6px) scale(0.94)",
    backgroundColor: "rgba(8, 8, 10, 0.66)",
    borderColor: "rgba(255, 255, 255, 0.09)",
    transition: { type: "spring", duration: 0.5, bounce: 0.12 },
  },
};

export function Navbar() {
  const dict = useDictionary();
  const locale = useLocale();
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
      <motion.nav
        variants={shell}
        animate={compact ? "compact" : "top"}
        className="flex items-center justify-between gap-4 rounded-full border px-4 py-2.5 backdrop-blur-xl sm:-mx-5 sm:px-5"
      >
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 text-white"
          aria-label={`${COMPANY.name} — ${dict.nav.backToTop}`}
        >
          <Logo />
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
          className="hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
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

        {/* Language and the call to action travel together on the right. */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LocaleSwitcher />


          <Link
  href="#contact"
  className="group flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-[13px] text-white/80 transition-all duration-300 ease-out hover:bg-white/10 hover:text-white"
>
  {dict.nav.cta}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform duration-300 group-hover:translate-x-1"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
</Link>
        </div>
      </motion.nav>
    </motion.header>
  );
}
