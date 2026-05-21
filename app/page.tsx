import { Assistant } from "@/components/site/Assistant";
import { DemoDashboard } from "@/components/site/DemoDashboard";
import { Footer } from "@/components/site/Footer";
import { HashCleaner } from "@/components/site/HashCleaner";
import { Hero } from "@/components/site/Hero";
import { Modules } from "@/components/site/Modules";
import { Nav } from "@/components/site/Nav";
import { Principles } from "@/components/site/Principles";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <DemoDashboard />
        <Modules />
        <Assistant />
        <Principles />
      </main>
      <Footer />
      <HashCleaner sectionIds={["demo", "modules", "assistant", "principles"]} />
    </>
  );
}
