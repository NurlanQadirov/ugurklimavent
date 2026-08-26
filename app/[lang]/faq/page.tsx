import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/page-meta";
import { buildGraph } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return buildPageMetadata(lang, "faq");
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getSiteDictionary(lang);
  const page = dict.meta.pages.faq;

  return (
    <div className="pt-24 sm:pt-28">
      {/*
        On this route the page node in the graph *is* the `FAQPage` and carries
        `mainEntity` itself — see `webPage()` in lib/schema.ts. The landing page
        emits a separate `FAQPage` node beside its `WebPage`, because there the
        questions are one section among six rather than the subject of the URL.
      */}
      <JsonLd
        data={buildGraph({
          dict,
          locale: lang,
          route: "/faq",
          title: page.title,
          description: page.description,
        })}
      />
      {/*
        Same reasoning as the other sub-routes: `<Faq />` leads with an `<h2>`,
        correct on the landing page where the hero owns the `<h1>`, but it would
        leave this document with no `<h1>` at all. `sr-only` states the subject
        in full query phrasing without touching the section's display heading.
      */}
      <h1 className="sr-only">{page.h1}</h1>
      <Faq />
    </div>
  );
}
