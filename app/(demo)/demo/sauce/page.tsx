import type { Metadata } from "next";
import { Amatic_SC, Cabin } from "next/font/google";
import { Storefront } from "@/components/demos/sauce/Storefront";

/** The pairing ui-ux-pro-max returned for this product. Scoped to this demo. */
const amatic = Amatic_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-amatic",
  display: "swap",
});

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cabin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vegan sauce brand — demo",
  description:
    "A portfolio demo storefront built by BridVance. Not a real shop; no orders are taken.",
};

export default function SauceDemoPage() {
  return (
    <div className={`${amatic.variable} ${cabin.variable}`}>
      <Storefront />
    </div>
  );
}
