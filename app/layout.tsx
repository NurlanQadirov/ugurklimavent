import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Uğur Klima Vent MMC — Industrial HVAC & Fire Safety Engineering",
    template: "%s — Uğur Klima Vent MMC",
  },
  description:
    "Precision HVAC, industrial cooling, and FHN-certified fire protection systems designed for maximum operational reliability. Baku, Azerbaijan.",
  keywords: [
    "HVAC Baku",
    "industrial ventilation",
    "AHU installation",
    "VRF systems",
    "fire protection FHN",
    "sprinkler systems",
    "chiller engineering",
  ],
  openGraph: {
    title: "Uğur Klima Vent MMC — Industrial HVAC & Fire Safety Engineering",
    description:
      "Precision HVAC, industrial cooling, and FHN-certified fire protection systems designed for maximum operational reliability.",
    locale: "en",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-white">
        <MotionProvider>
          <SmoothScroll />
          <ScrollProgress />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
