import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import { Booking } from "@/components/demos/clinic/Booking";

/** The pairing ui-ux-pro-max returned for this product. */
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clinic booking — demo",
  description:
    "A portfolio demo booking site built by BridVance. Not a real clinic; no appointments are scheduled.",
};

export default function ClinicDemoPage() {
  return (
    <div className={`${figtree.variable} ${noto.variable}`}>
      <Booking />
    </div>
  );
}
