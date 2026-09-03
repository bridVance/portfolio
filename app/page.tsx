import { pageMetadataHome } from "@/lib/seo";

export const metadata = pageMetadataHome({
  absoluteTitle: "BridVance — design & agentic automation",
  description:
    "A studio building distinctive web front-ends and agentic automation systems.",
});

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">BridVance</p>
      <h1 className="mt-3 text-4xl font-medium md:text-6xl">
        Distinctive front-ends. Automation that actually runs.
      </h1>
      <p className="mt-6 max-w-[60ch] font-body text-muted">
        A small studio building web experiences worth looking at, and agentic
        systems that handle the repetitive work behind them.
      </p>
    </div>
  );
}
