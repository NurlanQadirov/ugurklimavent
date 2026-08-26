"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Themed to the panel rather than left on Sonner's default light card, which
 * would flash white over a near-black dashboard on every save.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!bg-graphite !border !border-white/10 !text-white !rounded-xl !shadow-2xl !shadow-black/60",
          description: "!text-white/45",
          actionButton: "!bg-volt !text-white",
          cancelButton: "!bg-white/10 !text-white/70",
          error: "!border-alarm/30",
        },
      }}
    />
  );
}
