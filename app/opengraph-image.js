import { ImageResponse } from "next/og";

// The picture shown when a link to the site is shared (TikTok, Instagram,
// messages). Drawn from code at build time: a taped note on cream paper.
export const alt = "Baking Debugged: baking, debugged.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#14342b";
const CREAM = "#faf4df";
const HIGHLIGHT = "#f4d96b";

export default function Image() {
  return new ImageResponse(
    (
      // Only a subset of CSS works here (flexbox, no grid), and every
      // element with more than one child needs display: flex.
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "70px 80px",
            background: "#fffdf3",
            boxShadow: "0 30px 60px -30px rgba(20,52,43,0.35)",
            transform: "rotate(-1.5deg)",
            position: "relative",
          }}
        >
          {/* the strip of tape */}
          <div style={{ position: "absolute", top: -22, left: 420, width: 170, height: 44, background: "#f1dc9a", transform: "rotate(-3deg)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="88" height="88" viewBox="0 0 512 512">
              <circle cx="256" cy="256" r="256" fill={INK} />
              <g fill="none" stroke={CREAM} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="150,172 68,256 150,340" strokeWidth="34" />
                <polyline points="362,172 444,256 362,340" strokeWidth="34" />
                <g transform="translate(256 256) rotate(22)">
                  <ellipse cx="0" cy="-58" rx="50" ry="88" strokeWidth="18" />
                  <ellipse cx="0" cy="-58" rx="17" ry="88" strokeWidth="14" />
                  <line x1="0" y1="34" x2="0" y2="140" strokeWidth="34" />
                </g>
              </g>
            </svg>
            <div style={{ fontSize: 40, fontWeight: 700, color: INK }}>Baking Debugged</div>
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 112,
              fontWeight: 800,
              color: INK,
              letterSpacing: -4,
              lineHeight: 1,
              // the highlighter swipe
              backgroundImage: `linear-gradient(transparent 60%, ${HIGHLIGHT} 60%)`,
            }}
          >
            Baking, debugged.
          </div>
          <div style={{ marginTop: 34, fontSize: 34, color: "#4b6259" }}>
            Recipes in grams, and the chemistry of why bakes work or fail.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
