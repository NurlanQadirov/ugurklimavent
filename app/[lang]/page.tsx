import { notFound } from "next/navigation";

import { Expertise } from "@/components/site/Expertise";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { JsonLd } from "@/components/site/JsonLd";
import { Manifesto } from "@/components/site/Manifesto";
import { Process } from "@/components/site/Process";
import { Sectors } from "@/components/site/Sectors";
import { Stats } from "@/components/site/Stats";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { buildGraph } from "@/lib/schema";

/**
 * The landing page keeps the full single-page scroll exactly as it was — the
 * dedicated `/expertise`, `/process` and `/sectors` routes are additional
 * entry points onto the same sections, not a replacement for them.
 *
 * The page component is a Server Component and every section below is a
 * `"use client"` island. That is the arrangement the metadata APIs require:
 * `generateMetadata` and the JSON-LD script run on the server, the animation
 * stays in the client, and neither has to know about the other. Nothing here
 * needed a `"use client"` wrapper — the boundary was already in the right
 * place, one level below this file.
 */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <JsonLd
        data={buildGraph({
          dict,
          locale: lang,
          route: "",
          title: dict.meta.title,
          description: dict.meta.description,
        })}
      />
      <Hero />
      <Manifesto />
      <Expertise />
      <Stats />
      <Process />
      <Sectors />
      <Faq />
    </>
  );
}
