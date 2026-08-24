import { BlueprintBackdrop } from "@/components/motion/BlueprintBackdrop";
import { Expertise } from "@/components/site/Expertise";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { Navbar } from "@/components/site/Navbar";
import { Process } from "@/components/site/Process";
import { Sectors } from "@/components/site/Sectors";
import { Stats } from "@/components/site/Stats";

export default function Home() {
  return (
    <>
      <BlueprintBackdrop />
      <Navbar />
      <main>
        <Hero />
        <Manifesto />
        <Expertise />
        <Stats />
        <Process />
        <Sectors />
      </main>
      <Footer />
    </>
  );
}
