/**
 * SQLite has no scalar list type, so the string arrays on the content models
 * (`tags`, `outputs`, `phones`) are stored as JSON text.
 *
 * These helpers are the only place that knows that. Both are total: a row
 * written by hand, a column left at its `"[]"` default, or a value that somehow
 * parsed to a non-array all yield an empty list rather than throwing during a
 * render. A malformed tag list should cost one card its chips, not the page.
 */

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function stringifyList(value: readonly string[]): string {
  return JSON.stringify(value.map((item) => item.trim()).filter(Boolean));
}

/**
 * Splits the newline- or comma-separated text the admin textareas collect into
 * a clean list. Newlines win, so a tag containing a comma survives.
 */
export function parseListInput(value: string): string[] {
  const source = value.includes("\n") ? value.split("\n") : value.split(",");
  return source.map((item) => item.trim()).filter(Boolean);
}

/** The inverse, for populating an edit form. */
export function toListInput(value: readonly string[]): string {
  return value.join("\n");
}
