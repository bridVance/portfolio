export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    // Same measure as the body sections (max-w-6xl), so a page's header sits on
    // the same left edge as everything under it rather than indenting. The lede
    // keeps its own max-w so the line length stays readable.
    <header className="mx-auto max-w-6xl px-4 pb-10 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-medium md:text-5xl">{title}</h1>
      {lede ? <p className="mt-4 max-w-[60ch] font-body text-muted">{lede}</p> : null}
    </header>
  );
}
