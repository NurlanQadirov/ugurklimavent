"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import { COMPANY, telHref } from "@/lib/content";
import { useDictionary, useLocale } from "@/i18n/DictionaryProvider";
import { getLenis } from "@/components/motion/lenis-instance";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { staggerParent } from "@/components/motion/tokens";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NAV_LINKS } from "./nav-links";

/** Every focusable the sheet is allowed to cycle through. */
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sheet: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

/** Rows arrive from below, in order, once the sheet itself is up. */
const row: Variants = {
  hidden: { opacity: 0, transform: "translateY(24px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { type: "spring", duration: 0.6, bounce: 0.14 },
  },
};

/**
 * Navigation for every viewport below `lg`.
 *
 * This exists because the bar could not hold its contents there. With five
 * links, the logo, the locale switcher and the call to action, the flex row ran
 * out of width somewhere around 880px and the browser resolved it by wrapping
 * the CTA label onto two and then three lines — the bar grew from 59px to 98px
 * and the button stopped looking like a button. Below `md` the link list was
 * hidden outright and there was no menu of any kind, so a phone visitor had no
 * way to reach `/expertise`, `/process`, `/sectors` or `/faq` at all except by
 * guessing the URL. That is a navigation hole, and on a site whose sub-routes
 * are the SEO surface it is also a crawl-depth problem: those pages were
 * reachable from the sitemap but not from the mobile document.
 *
 * The sheet takes the whole viewport rather than dropping a panel under the
 * bar. At 768–1023px a dropdown would cover a third of the screen and leave the
 * page visible and scrollable behind it; a full sheet is unambiguous at every
 * size this renders at, and it is the only variant that does not need a second
 * layout at the tablet breakpoint.
 */
export function MobileMenu() {
  const dict = useDictionary();
  const locale = useLocale();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * Close on navigation, adjusting state during render rather than in an
   * effect. Each link also closes the sheet in its own `onClick`, so this is
   * not what handles the common path — it is the guard for the one that has no
   * click at all: browser Back. That changes the pathname without remounting
   * the component, and without this the sheet would sit over the page the
   * reader just went back to.
   *
   * React explicitly supports this pattern: the re-render happens before the
   * browser paints, so it costs nothing visible, whereas the same `setOpen` in
   * an effect renders the wrong UI first and then corrects it.
   */
  const [renderedFor, setRenderedFor] = useState(pathname);
  if (renderedFor !== pathname) {
    setRenderedFor(pathname);
    setOpen(false);
  }

  /*
   * While the sheet is up: stop Lenis, hold the scroll position, trap focus,
   * and let Escape out. All four belong together — each one alone leaves the
   * overlay half-broken.
   */
  useEffect(() => {
    if (!open) return;

    const lenis = getLenis();
    lenis?.stop();
    // Lenis' own class is what applies `overflow: clip` in globals.css. Under
    // reduced motion Lenis is not running at all, so the class is set directly.
    document.documentElement.classList.add("lenis-stopped");

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // The close button is inside the panel and is the safest landing spot: a
    // reader arrives on the control that undoes what they just did.
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      // Wrap at both ends, so Tab can never land on the page behind the sheet.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("lenis-stopped");
      getLenis()?.start();
      // Focus goes back where it came from, which is the trigger in every path
      // except a navigation — and there the new document owns focus anyway.
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors duration-200 ease-out-strong hover:bg-white/10 hover:text-white lg:hidden"
      >
        {/*
          Two rules that cross into an X. They are positioned from the centre and
          only ever transformed, so the animation stays on the compositor and
          the hit area never moves.
        */}
        <span aria-hidden className="relative block h-3 w-4">
          <motion.span
            animate={
              open
                ? { transform: "translateY(5.5px) rotate(45deg)" }
                : { transform: "translateY(0px) rotate(0deg)" }
            }
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="absolute inset-x-0 top-0 block h-px origin-center bg-current"
          />
          <motion.span
            animate={
              open
                ? { transform: "translateY(-5.5px) rotate(-45deg)" }
                : { transform: "translateY(0px) rotate(0deg)" }
            }
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="absolute inset-x-0 bottom-0 block h-px origin-center bg-current"
          />
        </span>
      </button>

      {/*
        Portalled to `<body>`, and that is not optional.
        `Navbar` animates the bar's own `transform` (it scales down on scroll),
        and an element with a transform becomes the containing block for every
        `position: fixed` descendant. Left inside the bar, `fixed inset-0`
        resolved against the *nav* instead of the viewport — the sheet rendered
        742x152 in the corner rather than full screen. The portal takes it out
        of that subtree entirely, which is also where a `role="dialog"` belongs:
        a modal nested inside a `<nav>` inside a `<header>` is a landmark inside
        a landmark.

        The `document` check is a server guard, not a mounted gate: on the
        server there is no document, and on the client's first render `open` is
        still `false`, so the portal contributes no DOM either way and there is
        nothing for hydration to mismatch.
      */}
      {typeof document === "undefined"
        ? null
        : createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={panelRef}
                  id={panelId}
                  role="dialog"
                  aria-modal="true"
                  aria-label={dict.a11y.menu}
                  variants={sheet}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="gutter fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-void/95 pb-10 pt-24 backdrop-blur-xl sm:pt-28 lg:hidden"
                >
                  {/*
              A second, full-size close target sitting exactly under the trigger.
              The trigger itself is in the bar above this layer, and the bar is
              `z-50` to this sheet's `z-[55]` — without this the X the reader can
              see would not be the element they hit.
            */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={dict.a11y.closeMenu}
                    className="absolute right-6 top-8 h-9 w-9 rounded-full sm:right-8 sm:top-9"
                  >
                    <span
                      aria-hidden
                      className="relative mx-auto block h-3 w-4"
                    >
                      <span className="absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 rotate-45 bg-white" />
                      <span className="absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 -rotate-45 bg-white" />
                    </span>
                  </button>

                  <motion.nav
                    aria-label={dict.a11y.menu}
                    variants={staggerParent(0.05, 0.08)}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-1 flex-col justify-center"
                  >
                    <ul className="border-t border-white/[0.07]">
                      {NAV_LINKS.map((link, i) => (
                        <motion.li
                          key={link.href}
                          variants={row}
                          className="group border-b border-white/[0.07]"
                        >
                          {link.href.startsWith("#") ? (
                            <a
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className="flex items-baseline gap-5 py-5 text-[clamp(1.6rem,7vw,2.5rem)] font-medium tracking-tight text-white/85 transition-colors duration-200 ease-out-strong hover:text-white"
                            >
                              <span
                                aria-hidden
                                className="font-mono text-[10px] tracking-[0.2em] text-white/25"
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              {dict.nav.links[link.key]}
                            </a>
                          ) : (
                            <Link
                              href={`/${locale}${link.href}`}
                              onClick={() => setOpen(false)}
                              className="flex items-baseline gap-5 py-5 text-[clamp(1.6rem,7vw,2.5rem)] font-medium tracking-tight text-white/85 transition-colors duration-200 ease-out-strong hover:text-white"
                            >
                              <span
                                aria-hidden
                                className="font-mono text-[10px] tracking-[0.2em] text-white/25"
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              {dict.nav.links[link.key]}
                            </Link>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.nav>

                  {/*
              The call to action and the language toggle come with the sheet
              rather than staying in the bar: they are what the bar could not fit
              alongside five links, and this is the layer with room for them.
            */}
                  <motion.div
                    variants={row}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.34 }}
                    className="mt-10 flex shrink-0 flex-col gap-8"
                  >
                    <MagneticLink href={telHref(COMPANY.phones[0])}>
                      {dict.nav.cta}
                    </MagneticLink>

                    <div className="flex items-center justify-between">
                      <LocaleSwitcher />
                      <a
                        href={telHref(COMPANY.phones[0])}
                        className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors duration-200 ease-out-strong hover:text-white"
                      >
                        {COMPANY.phones[0]}
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )}
    </>
  );
}
