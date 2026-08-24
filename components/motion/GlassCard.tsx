"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { SPRING_SNAP } from "./tokens";
import { useFinePointer } from "./use-fine-pointer";

const ACCENT_RGB = {
  volt: "29, 123, 255",
  alarm: "255, 59, 48",
} as const;

type GlassCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  accent?: keyof typeof ACCENT_RGB;
  children?: ReactNode;
};

/**
 * Deep-glass surface with two cursor-tracked layers: an interior spotlight and
 * a 1px gradient border. Both are decorative mouse-tracking, so they live
 * behind a fine-pointer gate and never move anything the reader is parsing.
 */
export function GlassCard({
  accent = "volt",
  className,
  children,
  ...rest
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  // Parked far outside the card so the first frame after hover has no flash.
  const px = useMotionValue(-500);
  const py = useMotionValue(-500);

  const rgb = ACCENT_RGB[accent];
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${px}px ${py}px, rgba(${rgb}, 0.10), transparent 68%)`;
  const borderGlow = useMotionTemplate`radial-gradient(240px circle at ${px}px ${py}px, rgba(${rgb}, 0.85), transparent 62%)`;

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    px.set(event.clientX - rect.left);
    py.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={fine ? trackPointer : undefined}
      whileHover={
        fine
          ? {
              transform: "translateY(-4px) scale(1.006)",
              transition: SPRING_SNAP,
            }
          : undefined
      }
      className={cn(
        "relative isolate overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/[0.02] backdrop-blur-xl",
        fine && "group",
        className,
      )}
      {...rest}
    >
      {/* Interior spotlight */}
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-out-strong group-hover:opacity-100"
      />

      {/* 1px glowing border, masked to the perimeter */}
      <motion.div
        aria-hidden
        style={{ background: borderGlow }}
        className="glow-border pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 ease-out-strong group-hover:opacity-100"
      />

      {/* Top edge highlight — the tell that reads as real glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {children}
    </motion.div>
  );
}
