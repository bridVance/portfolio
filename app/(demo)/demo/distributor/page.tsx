import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Portal } from "@/components/demos/distributor/Portal";

/** The face ui-ux-pro-max returned for this product, for both roles. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Distributor portal — demo",
  description:
    "A portfolio demo B2B ordering portal built by BridVance. Not a real account; no orders are placed.",
};

export default function DistributorDemoPage() {
  return (
    <div className={jakarta.variable}>
      <Portal />
    </div>
  );
}
