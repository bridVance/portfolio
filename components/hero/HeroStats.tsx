/**
 * Three facts under the headline, borrowed from the alternate direction the
 * design skill generated: its hero carried figures beside the thesis, and that
 * is the thing this one was missing — a headline and a paragraph, then nothing
 * to hold on to.
 *
 * Every figure restates a promise the site already makes elsewhere. Nothing
 * here is a number we cannot stand behind: the tier count is the services
 * page, "weeks" is the packaged tier's own wording, and one business day is
 * what /contact commits to.
 */
const STATS = [
  { figure: "Four", line: "tiers, cheapest and fastest first" },
  { figure: "Weeks", line: "for a packaged agent, not quarters" },
  { figure: "1 day", line: "to hear back on an enquiry" },
] as const;

export function HeroStats() {
  return (
    /* oxlint-disable-next-line jsx-a11y/no-redundant-roles */
    <ul role="list" className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
      {STATS.map((s) => (
        <li key={s.figure} className="bg-surface px-4 py-4">
          <p className="font-display text-2xl font-semibold tracking-tight text-fg">
            {s.figure}
          </p>
          <p className="mt-1 font-body text-sm leading-snug text-muted">{s.line}</p>
        </li>
      ))}
    </ul>
  );
}
