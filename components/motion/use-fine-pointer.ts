"use client";

import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

/**
 * True only for real pointers. Touch screens fire a synthetic hover on tap,
 * which would leave magnetic and spotlight states stuck on after a press.
 *
 * Starts `false` on both server and first client render, so hydration matches.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const sync = () => setFine(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return fine;
}
