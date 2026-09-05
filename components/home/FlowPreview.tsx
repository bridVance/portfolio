const NODES = [
  { x: 10, y: 76, label: "WhatsApp" },
  { x: 98, y: 76, label: "Qualify" },
  { x: 186, y: 28, label: "Book" },
  { x: 186, y: 124, label: "Follow up" },
] as const;

/**
 * Decorative automation graph — the visual half of the "Automation" panel
 * (§5.1): a message arrives, gets qualified, and fans out into a booking and a
 * follow-up. Inline SVG plus one CSS keyframe (`.bv-flow` in globals.css) that
 * marches the connector dashes, staggered per edge, so it reads as work moving
 * through. No JS, no dependencies. `aria-hidden` — the panel's heading and link
 * carry the meaning.
 */
export function FlowPreview() {
  return (
    <div
      aria-hidden
      className="grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-lg border border-line bg-surface p-4"
    >
      <svg viewBox="0 0 260 180" className="w-full" fill="none">
        <g stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M74 90 H98" className="bv-flow" />
          <path d="M162 90 C174 90 174 42 186 42" className="bv-flow bv-flow--2" />
          <path
            d="M162 90 C174 90 174 138 186 138"
            className="bv-flow bv-flow--3"
          />
        </g>

        {NODES.map((node) => (
          <g key={node.label}>
            <rect
              x={node.x}
              y={node.y}
              width="64"
              height="28"
              rx="6"
              fill="var(--surface-2)"
              stroke="var(--line)"
            />
            <circle
              cx={node.x + 11}
              cy={node.y + 14}
              r="2.5"
              fill="var(--accent)"
            />
            <text
              x={node.x + 19}
              y={node.y + 17.5}
              className="font-mono"
              fontSize="7.5"
              fill="var(--muted)"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
