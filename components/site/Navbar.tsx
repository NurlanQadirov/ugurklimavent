"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, type Variants } from "framer-motion";

import { COMPANY, telHref } from "@/lib/content";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { SPRING_ENTRANCE, riseChildTight, staggerParent } from "@/components/motion/tokens";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Expertise", href: "#expertise" },
  { label: "Method", href: "#process" },
  { label: "Sectors", href: "#sectors" },
  { label: "Contact", href: "#contact" },
] as const;

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
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <motion.nav
        variants={shell}
        animate={compact ? "compact" : "top"}
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border px-4 py-2.5 backdrop-blur-xl sm:px-5"
      >
        <a
          href="#top"
          className="flex items-center gap-3 text-white"
          aria-label={`${COMPANY.name} — back to top`}
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
        </a>

        <motion.ul
          variants={staggerParent(0.05, 0.35)}
          initial="hidden"
          animate="visible"
          className="hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
            <motion.li key={link.href} variants={riseChildTight}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2 text-[13px] text-white/55 transition-colors duration-200 ease-out-strong hover:text-white"
              >
                {link.label}
              </a>
            </motion.li>
          ))}
          <motion.li variants={riseChildTight}>
            <a
              href={telHref(COMPANY.phones[0])}
              className="hidden rounded-full px-4 py-2 font-mono text-[12px] tracking-tight text-white/55 transition-colors duration-200 ease-out-strong hover:text-white lg:block"
            >
              {COMPANY.phones[0]}
            </a>
          </motion.li>
        </motion.ul>

        <MagneticLink
          href="#contact"
          variant="ghost"
          pull={0.2}
          className="px-5 py-2 text-[13px]"
        >
          Request Audit
        </MagneticLink>
      </motion.nav>
    </motion.header>
  );
}
