/**
 * What a packaged agent covers, and the kind of business it fits. The
 * transcript below shows one exchange; these answer the two questions a buyer
 * asks before they bother reading it — is this my problem, and am I the sort
 * of business it was built for.
 *
 * Server component: no state, no JS. Filled pills for what it does, outline
 * pills for who it is for — the distinction is weight, not a new colour, so it
 * stays inside the palette the rest of the page uses.
 */

type Props = {
  handles: readonly string[];
  builtFor: readonly string[];
};

function ChipRow({
  label,
  items,
  outline,
}: {
  label: string;
  items: readonly string[];
  outline?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      {/* aria-label so the row is announced as "Built for, list, 4 items"
          rather than an unnamed list of nouns. */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul role="list" aria-label={label} className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={
              outline
                ? "rounded-full border border-node-line px-2.5 py-1 font-body text-xs text-muted"
                : "rounded-full bg-chip px-2.5 py-1 font-body text-xs text-fg"
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentSpec({ handles, builtFor }: Props) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <ChipRow label="Handles" items={handles} />
      <ChipRow label="Built for" items={builtFor} outline />
    </div>
  );
}
