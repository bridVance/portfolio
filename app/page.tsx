import { pageMetadataHome } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — design & agentic automation",
  description:
    "A studio building distinctive web front-ends and agentic automation systems.",
});

export default function HomePage() {
  return <Hero />;
}
