import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/site/JsonLd";
import { Process } from "@/components/site/Process";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/page-meta";
import { buildGraph } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/process">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return buildPageMetadata(lang, "process");
}

export default async function ProcessPage({ params }: PageProps<"/[lang]/process">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const page = dict.meta.pages.process;

  return (
    <div className="pt-24 sm:pt-28">
      <JsonLd
        data={buildGraph({
          dict,
          locale: lang,
          route: "/process",
          title: page.title,
          description: page.description,
        })}
      />
      {/*
        `<Process />` leads with an `<h2>`, which is correct on the landing page
        where the hero owns the `<h1>` — but on this route it left the document
        with no `<h1>` at all and a heading outline starting at level 2. Both
        Google and every screen reader use the `<h1>` as the page's subject.

        `sr-only` keeps it out of the visual design entirely: the section's own
        display heading is unchanged, and this states the page's subject in the
        long-tail phrasing a search query or an LLM prompt actually uses.
      */}
      <h1 className="sr-only">{page.h1}</h1>
      <Process />
    </div>
  );
}
