import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

/**
 * A second root layout, sibling to `app/[lang]/layout.tsx`.
 *
 * The public site has no top-level `app/layout.tsx` — the locale layout renders
 * `<html>` itself — so `/admin` has to bring its own. That is the documented
 * multiple-root-layouts arrangement, and it is what keeps the panel genuinely
 * separate: none of the site's providers, smooth-scrolling, blueprint backdrop
 * or scroll-progress bar are mounted here, so nothing the admin panel does can
 * reach the public rendering.
 *
 * The auth guard is deliberately *not* here. `/admin/login` is nested under
 * this segment and a guard at this level would redirect the login page to
 * itself. It lives one level down, in the `(panel)` group.
 */

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "İdarəetmə",
    template: "%s — İdarəetmə",
  },
  // The back office has nothing to offer a crawler and should never appear in a
  // result page next to the site it administers.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="az"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void font-sans text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
