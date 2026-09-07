/**
 * One small diagram per accelerator. A transcript suits an agent, which talks;
 * these are plumbing, so each shows the shape of what it does instead —
 * channels converging, a sync running both ways, a document being read, a
 * suite passing, a layout assembling.
 *
 * Server components: inline SVG plus CSS keyframes, no JS and nothing added to
 * the bundle. Decorative, so `aria-hidden` — the item's own text carries the
 * meaning, and a screen reader gains nothing from a diagram of a dashed line.
 */

const box = {
  fill: "var(--surface-2)",
  stroke: "var(--line)",
} as const;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="mt-5 rounded-lg border border-line bg-surface p-4"
    >
      <svg viewBox="0 0 260 104" className="w-full" fill="none">
        {children}
      </svg>
    </div>
  );
}

/** Four inbound channels folding into one agent. */
function Channels() {
  const rows = [8, 34, 60, 86];
  return (
    <Frame>
      <g stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round">
        {rows.map((y, i) => (
          <path
            key={y}
            d={`M72 ${y + 7} C 130 ${y + 7}, 140 52, 196 52`}
            className={`bv-flow${i % 3 ? ` bv-flow--${(i % 3) + 1}` : ""}`}
          />
        ))}
      </g>
      {["WhatsApp", "Web chat", "Email", "Forms"].map((label, i) => (
        <g key={label}>
          <rect x="4" y={rows[i]} width="68" height="15" rx="4" {...box} />
          <text
            x="12"
            y={rows[i] + 11}
            className="font-mono"
            fontSize="7.5"
            fill="var(--muted)"
          >
            {label}
          </text>
        </g>
      ))}
      <circle cx="204" cy="52" r="9" fill="var(--accent)" />
      <text
        x="218"
        y="55"
        className="font-mono"
        fontSize="7.5"
        fill="var(--muted)"
      >
        agent
      </text>
    </Frame>
  );
}

/** Read and written, so the dashes march in both directions at once. */
function Systems() {
  return (
    <Frame>
      <g stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M74 34 H150" className="bv-flow" />
        <path d="M150 70 H74" className="bv-flow bv-flow--rev" />
      </g>
      <rect x="4" y="18" width="70" height="18" rx="5" {...box} />
      <text x="12" y="30" className="font-mono" fontSize="7.5" fill="var(--muted)">
        Calendar
      </text>
      <rect x="4" y="60" width="70" height="18" rx="5" {...box} />
      <text x="12" y="72" className="font-mono" fontSize="7.5" fill="var(--muted)">
        CRM
      </text>
      <rect x="152" y="36" width="76" height="26" rx="6" fill="var(--accent)" />
      <text x="166" y="53" className="font-mono" fontSize="8" fill="var(--on-accent)">
        agent
      </text>
    </Frame>
  );
}

/** A page being read, with the line an answer came from marked. */
function Retrieval() {
  const lines = [14, 28, 42, 56, 70, 84];
  return (
    <Frame>
      <rect x="4" y="4" width="120" height="96" rx="6" {...box} />
      {lines.map((y, i) => (
        <rect
          key={y}
          x="14"
          y={y}
          width={i === 3 ? 70 : 96}
          height="4"
          rx="2"
          fill="var(--line)"
        />
      ))}
      {/* The sweep passes down the page; the marked line stays lit. */}
      <rect
        x="8"
        y="0"
        width="112"
        height="12"
        rx="3"
        fill="var(--accent)"
        opacity="0.16"
        className="bv-sweep"
      />
      <rect x="14" y="56" width="70" height="4" rx="2" fill="var(--accent)" />
      <path
        d="M132 58 H160"
        stroke="var(--line)"
        strokeWidth="1.5"
        className="bv-flow"
      />
      <rect x="164" y="46" width="92" height="26" rx="6" {...box} />
      <text x="174" y="57" className="font-mono" fontSize="7.5" fill="var(--fg)">
        answer
      </text>
      <text x="174" y="67" className="font-mono" fontSize="6.5" fill="var(--muted)">
        page 3
      </text>
    </Frame>
  );
}

/** A suite running: each case settles to a pass, in turn. */
function Evaluation() {
  const cases = ["books the right slot", "refuses out of hours", "hands over", "cites a source"];
  return (
    <Frame>
      {cases.map((label, i) => {
        const y = 10 + i * 23;
        return (
          <g key={label} className={`bv-case bv-case--${i + 1}`}>
            <rect x="4" y={y} width="14" height="14" rx="4" {...box} />
            <path
              d={`M7.5 ${y + 7} l3 3 l6 -6.5`}
              stroke="var(--status)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="bv-check"
            />
            <text
              x="26"
              y={y + 11}
              className="font-mono"
              fontSize="7.5"
              fill="var(--muted)"
            >
              {label}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

/** The interface coming together around it. */
function InterfaceKit() {
  // width/height, not w/h: SVG ignores the short forms, so the rects spread to
  // zero size and the diagram renders empty.
  const blocks = [
    { x: 4, y: 4, width: 252, height: 16 },
    { x: 4, y: 26, width: 120, height: 74 },
    { x: 132, y: 26, width: 124, height: 34 },
    { x: 132, y: 66, width: 124, height: 34 },
  ];
  return (
    <Frame>
      {blocks.map((b, i) => (
        <rect
          key={`${b.x}-${b.y}`}
          {...b}
          rx="5"
          {...box}
          className={`bv-assemble bv-assemble--${i + 1}`}
        />
      ))}
    </Frame>
  );
}

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  Channels,
  "Your systems": Systems,
  Retrieval,
  Evaluation,
  "Interface kit": InterfaceKit,
};

export function PartDiagram({ term }: { term: string }) {
  const Diagram = DIAGRAMS[term];
  return Diagram ? <Diagram /> : null;
}
