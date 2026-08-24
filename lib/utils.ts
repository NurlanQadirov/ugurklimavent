/**
 * Dependency-free class joiner. Kept intentionally small: this project has no
 * `clsx`/`tailwind-merge`, so conflicting utilities are avoided by construction
 * rather than resolved at runtime.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
