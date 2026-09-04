import { pageMetadataHome } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { Thesis } from "@/components/home/Thesis";
import { DesignAutomationSplit } from "@/components/home/DesignAutomationSplit";
import { HowWeBuild } from "@/components/home/HowWeBuild";
import { ContactBand } from "@/components/home/ContactBand";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — design & agentic automation",
  description:
    "A studio building distinctive web front-ends and agentic automation systems.",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Thesis />
      <DesignAutomationSplit />
      <HowWeBuild />
      <ContactBand />
    </>
  );
}
