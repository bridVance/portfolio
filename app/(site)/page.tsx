import { pageMetadataHome } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { CapabilityMarquee } from "@/components/home/CapabilityMarquee";
import { Thesis } from "@/components/home/Thesis";
import { DesignAutomationSplit } from "@/components/home/DesignAutomationSplit";
import { HowWeBuild } from "@/components/home/HowWeBuild";
import { HowWeWork } from "@/components/home/HowWeWork";
import { ContactBand } from "@/components/home/ContactBand";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — AI agents, assistants & the interfaces around them",
  description:
    "An independent AI agency: agents and assistants that carry real work, the interfaces people meet them through, and products of our own.",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilityMarquee />
      <Thesis />
      <DesignAutomationSplit />
      <HowWeWork />
      <HowWeBuild />
      <ContactBand />
    </>
  );
}
