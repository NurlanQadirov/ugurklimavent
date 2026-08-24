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
    title: {
      default: meta.title,
      template: meta.titleTemplate,
    },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        LOCALES.map((locale) => [LOCALE_TAGS[locale], `/${locale}`]),
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: LOCALE_TAGS[lang],
      type: "website",
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
            <BlueprintBackdrop />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </DictionaryProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
