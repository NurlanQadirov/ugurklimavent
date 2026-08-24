"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Counts from zero when the figure scrolls into view.
 *
 * The final value is what renders on the server, so the number is correct
 * without JavaScript and correct for anything reading the DOM. The count-up is
 * armed on mount *only* if the element is still below the fold — resetting a
 * figure the reader can already see would flash the wrong number at them.
 *
 * Updates are written straight to the text node: 60 React renders a second to
 * paint a single string is work nobody needs to do.
 *
 * `counts` is deliberately never consumed. Strict Mode mounts effects twice,
 * and a one-shot flag would be spent by the first pass — leaving the second
 * pass to stop the animation and strand the figure at zero. Re-running simply
 * restarts the count instead.
 */
export function Counter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const counts = useRef(false);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce) return;

    if (node.getBoundingClientRect().top > window.innerHeight) {
      node.textContent = "0";
      counts.current = true;
    }
  }, [reduce]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || !counts.current) return;

    const controls = animate(0, value, {
      duration: 1.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
