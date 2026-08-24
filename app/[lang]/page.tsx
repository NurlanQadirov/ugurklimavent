import { Expertise } from "@/components/site/Expertise";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { Process } from "@/components/site/Process";
import { Sectors } from "@/components/site/Sectors";
import { Stats } from "@/components/site/Stats";

/**
 * The landing page keeps the full single-page scroll exactly as it was — the
 * dedicated `/expertise`, `/process` and `/sectors` routes are additional
 * entry points onto the same sections, not a replacement for them.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Expertise />
      <Stats />
      <Process />
      <Sectors />
    </>
  );
}
