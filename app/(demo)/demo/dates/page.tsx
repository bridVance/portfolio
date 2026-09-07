import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { Store } from "@/components/demos/dates/Store";

/**
 * The two faces ui-ux-pro-max paired for this product. Loaded here rather than
 * in app/fonts.ts because they belong to this demo alone — the studio site
 * never ships them.
 */
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dates importer — demo",
  description:
    "A portfolio demo storefront built by BridVance. Not a real shop; no orders are taken.",
};

export default function DatesDemoPage() {
  return (
    <div className={`${cormorant.variable} ${montserrat.variable}`}>
      <Store />
    </div>
  );
}
