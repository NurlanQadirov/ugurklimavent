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

type GlassCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
};

/**
 * Deep-glass surface with one cursor-tracked layer: a soft interior sheen that
 * follows the pointer across the card. Decorative mouse-tracking, so it lives
 * behind a fine-pointer gate and never moves anything the reader is parsing.
 *
 * **The card used to have an accent, and it does not any more.** Two of the
 * three hover layers here were coloured — a `rgba(29, 123, 255, 0.10)`
 * spotlight and a 1px gradient border at 85% of the same blue, both tracking
 * the cursor — and a grid of seven boxes that light up blue under the mouse is
 * the exact gesture that reads as a dashboard rather than as a capability
 * statement. The `accent` prop that selected between blue and red went with
 * them; nothing downstream needs to say what colour a card is when there is
 * only one colour.
 *
 * What is left is the part that was always doing the work: a white sheen, at a
 * third of the old strength, which is a surface catching light rather than a
 * surface emitting it.
 */
export function GlassCard({ className, children, ...rest }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  // Parked far outside the card so the first frame after hover has no flash.
  const px = useMotionValue(-500);
  const py = useMotionValue(-500);

  const sheen = useMotionTemplate`radial-gradient(420px circle at ${px}px ${py}px, rgba(255, 255, 255, 0.035), transparent 70%)`;

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
        /*
         * The border carries almost nothing. It used to be the only thing
         * separating the card from the page, which is why it had to be heavy
         * enough to see — and a grid of visible rectangles is what makes a dark
         * layout read as a form rather than a surface. `lift` takes over that
         * job with a contact shadow and an ambient pool, so the stroke can drop
         * back to a hairline that is felt at the corners and nowhere else.
         */
        "lift lift-hover border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm",
        /*
         * The hover tell, and the only one: the hairline resolves into an
         * actual edge. `zinc-700` is roughly white at 27%, so against a 5%
         * resting stroke it is a large step in relative terms and a small one
         * in absolute — the card firms up rather than lighting up. Colour is
         * transitioned alongside the shadow so the border and the lift arrive
         * as one gesture instead of two.
         */
        "hover:border-zinc-700",
        "transition-[border-color,box-shadow] duration-500 ease-out-strong",
        fine && "group",
        className,
      )}
      {...rest}
    >
      {/* Interior sheen */}
      <motion.div
        aria-hidden
        style={{ background: sheen }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out-strong group-hover:opacity-100"
      />

      {/*
        Top edge highlight — the tell that reads as real glass.

        Held at 10% rather than 25%. On a monochrome page this hairline is the
        brightest pixel on the card, and at a quarter white it drew a visible
        bright line across the top of every box in the bento.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent"
      />

      {children}
    </motion.div>
  );
}
