import type { Dictionary } from "@/i18n/types";

/**
 * Order and targets are structural; only the labels are translated. Routes are
 * locale-relative — a leading `#` stays an in-page anchor (only "contact"
 * does, since the footer it targets is mounted on every page), anything else
 * is prefixed with the active locale and resolved through `next/link`.
 *
 * Lifted out of `Navbar` so the desktop bar and the mobile sheet read from one
 * list. Two copies of a navigation array is how a link ends up on one and not
 * the other.
 */
export const NAV_LINKS = [
  { key: "expertise", href: "/expertise" },
  { key: "process", href: "/process" },
  { key: "sectors", href: "/sectors" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "#contact" },
] as const satisfies readonly {
  key: keyof Dictionary["nav"]["links"];
  href: string;
}[];
