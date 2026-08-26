import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { BlueprintBackdrop } from "@/components/motion/BlueprintBackdrop";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { DictionaryProvider } from "@/i18n/DictionaryProvider";
import { getDictionary } from "@/i18n/dictionaries";
import { LOCALES, LOCALE_TAGS, isLocale } from "@/i18n/config";
import { COMPANY } from "@/lib/content";
import { SITE_URL, absoluteUrl, languageAlternates, localePath } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Three known locales and one page — prerender all of them at build time. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { meta } = await getDictionary(lang);

  return {
    /**
     * Without this, every relative URL below (canonical, hreflang, OG) resolves
     * against `http://localhost:3000` in the build output. That is not a
     * cosmetic problem: a canonical pointing at localhost tells Google the real
     * page is a duplicate of a URL it cannot fetch.
     */
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      template: meta.titleTemplate,
    },
    description: meta.description,
    keywords: meta.keywords,
    applicationName: COMPANY.name,
    authors: [{ name: COMPANY.name, url: SITE_URL }],
    creator: COMPANY.name,
    publisher: COMPANY.name,
    /**
     * The layout's canonical is only ever correct for the locale root, and it
     * is *inherited* by `/expertise`, `/process` and `/sectors`. Each of those
     * pages therefore overrides both `alternates` keys in its own
     * `generateMetadata` — otherwise all four URLs in a locale would declare
     * `/az` as their canonical and three of them would drop out of the index.
     */
    alternates: {
      canonical: localePath(lang),
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: COMPANY.name,
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(lang),
      locale: LOCALE_TAGS[lang],
      // Tells a share target that the same page exists in the other two
      // languages — the OG-graph counterpart of hreflang.
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_TAGS[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    /**
     * Explicit crawl directives. `max-snippet: -1` and `max-image-preview:
     * large` are the two that matter for GEO: they lift the length cap on the
     * text an engine may quote from the page, which is precisely the text a
     * generative answer is assembled from. Left at the default, Google caps the
     * snippet and the page gets summarised from less material.
     */
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  // Narrows `lang` to `Locale` and 404s an unknown segment instead of throwing
  // at the dictionary lookup.
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={LOCALE_TAGS[lang]}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-white">
        <MotionProvider>
          <SmoothScroll />
          <ScrollProgress />
          {/*
            Below MotionProvider on purpose: the dictionary changes identity only
            on a locale navigation, and keeping it inside means `MotionConfig`
            is never re-created by a copy change.
          */}
          <DictionaryProvider locale={lang} dict={dict}>
            {/*
              Skip link. `sr-only` until focused, so nothing about the layout
              changes — but a keyboard user currently has to tab through the
              logo, four nav links, three locale links and the CTA before
              reaching any content, on every page.
            */}
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[#050505]"
            >
              {dict.a11y.skipToContent}
            </a>
            <BlueprintBackdrop />
            <Navbar />
            {/*
              `id` for the skip link; `tabIndex={-1}` so the browser actually
              moves focus here rather than only scrolling, which is the usual
              reason skip links look like they do nothing.
            */}
            <main id="main" tabIndex={-1} className="scroll-mt-24">
              {children}
            </main>
            <Footer />
          </DictionaryProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
