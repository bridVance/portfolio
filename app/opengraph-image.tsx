import { ImageResponse } from "next/og";

/**
 * The site had no og:image, so every share on LinkedIn, WhatsApp or Slack
 * rendered as a bare text card — an expensive omission for a studio whose
 * pitch is that surfaces are worth caring about.
 *
 * Generated rather than committed as a binary: it is built once at build time
 * (this route is static), so the wordmark and the palette stay in step with
 * the site instead of drifting from a PNG nobody remembers to re-export.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BridVance — AI agents, assistants and the interfaces around them";

// The dark theme's own tokens: --bg, --surface, --fg, --muted, --accent.
const BG = "#080b14";
const PANEL = "#0f1524";
const FG = "#e8ebf2";
const MUTED = "#8791a8";
const ACCENT = "#3b82f6";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: 72,
          // A hairline grid, echoing the site's rules without shipping an asset.
          backgroundImage: `linear-gradient(${PANEL} 1px, transparent 1px), linear-gradient(90deg, ${PANEL} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12.5 L9 18.5 L21 5.5"
              stroke={ACCENT}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: 40, color: FG, fontWeight: 700, letterSpacing: -0.5 }}>
              BridVance
            </span>
            <span style={{ fontSize: 20, color: MUTED, letterSpacing: 6 }}>AI AGENCY</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={{ fontSize: 68, color: FG, lineHeight: 1.1, letterSpacing: -1.5 }}>
            AI agents that actually ship.
          </span>
          <span style={{ fontSize: 30, color: MUTED, lineHeight: 1.35, maxWidth: 880 }}>
            Agents and assistants that carry real work, and the interfaces people
            meet them through.
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Websites", "Packaged agents", "Accelerators", "Bespoke"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 22,
                color: MUTED,
                border: "1px solid #212a42",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size
  );
}
