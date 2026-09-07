import type { Metadata } from "next";
import { fontVars } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Demo — BridVance",
  // These are portfolio pieces, not businesses. Keeping them out of the index
  // stops a fictional brand competing in search with a real one.
  robots: { index: false, follow: false },
};

/**
 * Root layout for the embedded demo sites.
 *
 * A second root layout, not a nested one: each demo owns its whole document so
 * it can set its own palette, fonts and background without those values
 * leaking into the studio site or inheriting from it. That is the whole point
 * of showing them in a frame — a vegan brand's greens and a watch
 * marketplace's near-black have to be able to sit on the same page as each
 * other and as BridVance's own blue.
 *
 * No nav, no footer, no theme toggle: the demo is the artefact, and the studio
 * chrome around it belongs to the page doing the embedding.
 */
export default function DemoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVars}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
