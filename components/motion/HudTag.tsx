"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * A floating drawing-sheet annotation — `[SEC_03 // GRID 6×4]` — pinned to a
 * section's corner like a datum tag on a CAD sheet.
 *
 * Pure decoration: machine notation, not copy, so it is untranslated and kept
 * out of the accessibility tree. Hidden below `md`, where a section corner is
 * already crowded by the content itself.
 */
export function HudTag({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, transform: "translateY(6px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "pointer-events-none absolute hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[rgb(var(--hud-ink)/0.45)] md:flex",
        className,
      )}
    >
      <span className="relative h-2 w-2">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
      </span>
      {label}
    </motion.span>
  );
}
