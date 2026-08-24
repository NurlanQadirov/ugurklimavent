import type Lenis from "lenis";

/**
 * Module-scoped handle on the live Lenis instance.
 *
 * `SmoothScroll` owns the instance, but the mobile menu has to suspend inertial
 * scrolling while it is open — an overlay that the page keeps gliding behind is
 * the classic smooth-scroll bug. Threading the instance through React context
 * would put a value that changes on a media-query event above the whole site
 * tree; a module binding keeps it out of the render path entirely.
 *
 * Null whenever Lenis is not running, which is the normal state under
 * `prefers-reduced-motion` — callers must handle that.
 */
let instance: Lenis | null = null;

export const setLenis = (next: Lenis | null) => {
  instance = next;
};

export const getLenis = () => instance;
