import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class joiner for the admin panel only.
 *
 * The public site has its own `cn` in `lib/utils.ts` — a plain filter-and-join
 * with no `tailwind-merge`. That one is deliberately left alone: its callers
 * avoid conflicting utilities by construction, and swapping in a resolver there
 * would put the site's rendered class strings at risk for no benefit.
 *
 * The admin components are variant-driven and do need conflict resolution, so
 * they get this instead. Two joiners, two audiences, no shared blast radius.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
