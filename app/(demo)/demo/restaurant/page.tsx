import type { Metadata } from "next";
import { Playfair_Display_SC, Karla } from "next/font/google";
import { Site } from "@/components/demos/restaurant/Site";

/** The pairing ui-ux-pro-max returned for this product. */
const playfair = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Restaurant — demo",
  description:
    "A portfolio demo restaurant site built by BridVance. Not a real restaurant; no tables are reserved.",
};

export default function RestaurantDemoPage() {
  return (
    <div className={`${playfair.variable} ${karla.variable}`}>
      <Site />
    </div>
  );
}
