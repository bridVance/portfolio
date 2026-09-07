import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Market } from "@/components/demos/watches/Market";

/**
 * The pairing ui-ux-pro-max returned: a sans for headings over a serif for
 * body, which is the inversion of the usual luxury arrangement.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfairBody = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vintage watch marketplace — demo",
  description:
    "A portfolio demo marketplace built by BridVance. Not a real marketplace; nothing is for sale.",
};

export default function WatchesDemoPage() {
  return (
    <div className={`${inter.variable} ${playfairBody.variable}`}>
      <Market />
    </div>
  );
}
