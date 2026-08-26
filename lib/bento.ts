/**
 * The expertise grid's fixed slots.
 *
 * The card footprint is a property of the *position*, not of the service that
 * happens to sit in it. Slot 1 is the tall hero card, slots 4–6 are the narrow
 * row, slot 7 spans the full width — and a service inherits whichever slot it
 * is ordered into. Move the third service to first and it becomes the tall
 * card; the one it displaced becomes the third.
 *
 * Keeping it this way rather than storing a class list per service is what lets
 * the admin panel offer plain reordering instead of asking an editor to type
 * Tailwind grid classes and hope the row still adds up to six columns.
 *
 * The pattern tiles the 6-column `lg` grid exactly:
 *
 *   row 1   [ 1 ..3.. ][ 2 ..3.. ]     slot 1 is 3 wide and 2 tall
 *   row 2   [ 1 cont. ][ 3 ..3.. ]
 *   row 3   [4 .2.][5 .2.][6 .2.]
 *   row 4   [ 7 .......6....... ]
 */
const SLOTS = [
  "lg:col-span-3 lg:row-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-6",
] as const;

/**
 * Anything past the designed seven falls back to thirds, which also tile to
 * six. Repeating the whole pattern instead would put a second tall hero card
 * halfway down the section, and there is only one hero.
 */
const OVERFLOW_SLOT = "lg:col-span-2";

/** The footprint for the card in position `index` (zero-based). */
export function slotSpan(index: number): string {
  return SLOTS[index] ?? OVERFLOW_SLOT;
}

/**
 * A short human description of each slot, for the admin list.
 *
 * An editor reordering the grid should be able to see what a move will do to
 * the layout without knowing what `lg:col-span-3` means.
 */
const SLOT_LABELS = [
  "Böyük kart (2 sətir)",
  "Geniş kart",
  "Geniş kart",
  "Dar kart",
  "Dar kart",
  "Dar kart",
  "Tam en",
] as const;

export function slotLabel(index: number): string {
  return SLOT_LABELS[index] ?? "Dar kart";
}

/** How many slots the designed pattern has, for the admin hint text. */
export const DESIGNED_SLOTS = SLOTS.length;
