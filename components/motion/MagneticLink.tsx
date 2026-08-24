"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";
import { SPRING_MAGNET } from "./tokens";
import { useFinePointer } from "./use-fine-pointer";

const PRESS = { type: "spring", duration: 0.2, bounce: 0 } as const;
const HOVER = { type: "spring", duration: 0.3, bounce: 0.1 } as const;

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  /** Fraction of the cursor's offset the element travels. Keep it small. */
  pull?: number;
  className?: string;
  variant?: "solid" | "ghost";
  ariaLabel?: string;
};

/**
 * Cursor-magnetised call to action.
 *
 * The magnet lives on an outer wrapper driven by motion values (no re-renders),
 * so the inner element keeps its own hover/press transforms without the two
 * fighting over the same `transform` string.
 */
export function MagneticLink({
  href,
  children,
  pull = 0.3,
  className,
  variant = "solid",
  ariaLabel,
}: MagneticLinkProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING_MAGNET);
  const y = useSpring(my, SPRING_MAGNET);
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;

  function attract(event: PointerEvent<HTMLSpanElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    mx.set((event.clientX - (rect.left + rect.width / 2)) * pull);
    my.set((event.clientY - (rect.top + rect.height / 2)) * pull);
  }

  function release() {
    mx.set(0);
    my.set(0);
  }

  const solid = variant === "solid";

  return (
    <motion.span
      ref={ref}
      style={fine ? { transform } : undefined}
      onPointerMove={fine ? attract : undefined}
      onPointerLeave={fine ? release : undefined}
      className="relative inline-flex"
    >
      {/* Ambient bloom — the only place the accent is allowed to spread. */}
      {solid ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-volt/20 opacity-50 blur-2xl transition-opacity duration-500 ease-out-strong hover:opacity-90"
        />
      ) : null}

      <motion.a
        href={href}
        aria-label={ariaLabel}
        whileHover={fine ? { transform: "scale(1.02)", transition: HOVER } : undefined}
        whileTap={{ transform: "scale(0.97)", transition: PRESS }}
        className={cn(
          "group relative inline-flex items-center gap-3 overflow-hidden rounded-full",
          "px-7 py-3.5 text-sm font-medium tracking-tight",
          solid
            ? "bg-white text-[#050505]"
            : "border border-white/15 bg-white/[0.02] text-white/80 backdrop-blur-xl hover:text-white",
          className,
        )}
      >
        <span className="relative z-10">{children}</span>

        {/* Arrow slides the width of its own box on hover. */}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 ease-out-strong motion-safe:group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
        </svg>

        {solid ? (
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-volt/25 to-transparent transition-transform duration-700 ease-out-strong motion-safe:group-hover:translate-x-full"
          />
        ) : null}
      </motion.a>
    </motion.span>
  );
}
