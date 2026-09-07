import Link from "next/link";

type Action = { href: string; label: string };

/**
 * What a page says while its content is still being written.
 *
 * The three thin routes were a heading and one sentence, so clicking "Work" in
 * the nav ended the visit: nothing explained the emptiness and nothing offered
 * a way on. This states plainly that the content is coming and hands over the
 * two routes that do have something behind them.
 */
export function EmptyState({
  note,
  actions,
}: {
  note: string;
  actions: readonly Action[];
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
      <p className="max-w-[52ch] font-body text-muted">{note}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {actions.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className={
              // One primary action per surface; the rest read as secondary.
              i === 0
                ? "inline-flex items-center rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-colors hover:bg-accent-strong focus-visible:bg-accent-strong"
                : "inline-flex items-center rounded-md border border-line px-5 py-3 font-mono text-sm text-fg transition-colors hover:border-accent"
            }
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
