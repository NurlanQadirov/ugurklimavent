"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

/**
 * The company logo in the navbar, read from `public/logo.png`.
 *
 * Falls back to the built-in `<Logo />` mark if the file is missing or fails to
 * decode. That is not defensive padding — the file is dropped in by hand, so
 * the interesting states are "not there yet" and "replaced with something the
 * browser cannot read", and both should leave a working header rather than a
 * broken-image glyph next to the company name.
 *
 * A plain `<img>` rather than `next/image`: the file's dimensions are not known
 * at build time (it is whatever gets copied in), and `next/image` wants an
 * explicit `width`/`height` pair. `h-7 w-auto` keeps the navbar's vertical
 * rhythm identical to the mark it replaces while letting any aspect ratio
 * through undistorted.
 */
export function BrandLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  /**
   * `onError` alone is not enough.
   *
   * The `<img>` is server-rendered, so a missing file fails while the HTML is
   * still static — before React has hydrated and attached the handler. The
   * event is gone by then and the fallback would never run; the header just
   * showed a zero-width gap. A ref callback runs the moment the element is
   * attached, which is late enough to see `complete && naturalWidth === 0` on
   * an image that already failed.
   */
  const check = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <Logo className={className} />;

  return (
    /*
      `next/image` is not a fit here. It needs an intrinsic `width`/`height`
      pair, and this file is dropped in by hand and may be replaced with one of
      a different size — a hardcoded pair would silently stop matching. A
      static import would read the dimensions automatically but turns the file
      into a build-time dependency, which is exactly the case the fallback
      above exists to survive.
    */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt=""
      /*
        Decorative: the link already carries the company name in its
        `aria-label`, and the name is spelled out in the text beside it. A
        described logo would make a screen reader announce the brand three
        times for one link.
      */
      aria-hidden
      /*
        Above the fold and part of the first paint, so it is fetched eagerly.
        Lazy-loading the header logo is how a brand mark ends up popping in
        after the hero has already rendered.
      */
      loading="eager"
      fetchPriority="high"
      decoding="async"
      ref={check}
      onError={() => setFailed(true)}
      className={cn("h-7 w-auto max-w-[180px] object-contain", className)}
    />
  );
}
