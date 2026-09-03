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
    <header className="mx-auto max-w-3xl px-4 pb-10 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-medium md:text-5xl">{title}</h1>
      {lede ? <p className="mt-4 max-w-[60ch] font-body text-muted">{lede}</p> : null}
    </header>
  );
}
