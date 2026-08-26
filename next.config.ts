import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /**
         * Uploaded icons.
         *
         * `sandbox` is the one that matters. An SVG is a document as well as an
         * image, so a file opened directly at `/uploads/...` would otherwise run
         * its own script in this origin. The sandbox denies it a script context
         * entirely, while still rendering fine inside the `<img>` on the card.
         *
         * `nosniff` stops a mistyped upload being re-interpreted as HTML.
         */
        source: "/uploads/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "sandbox" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
