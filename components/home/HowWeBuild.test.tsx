import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { HowWeBuild } from "./HowWeBuild";

test("renders every pillar with its one-line copy", () => {
  render(<HowWeBuild />);
  for (const term of [
    "Craft",
    "Evaluated",
    "Grounded",
    "Private",
    "Performance",
    "Accessible",
  ]) {
    expect(screen.getByText(term)).toBeInTheDocument();
  }
  expect(screen.getByText(/distinctive design, not templates\./i)).toBeInTheDocument();
  expect(screen.getByText(/fast on a mid-range phone/i)).toBeInTheDocument();
  expect(screen.getByText(/keyboard, contrast, reduced-motion/i)).toBeInTheDocument();
  expect(screen.getByText(/measured against real cases/i)).toBeInTheDocument();
  expect(screen.getByText(/with a source you can check/i)).toBeInTheDocument();
  expect(screen.getByText(/not used for training/i)).toBeInTheDocument();
});

test("the security-headers scan opens in a new tab with rel=noopener", () => {
  render(<HowWeBuild />);
  const scan = screen.getByRole("link", { name: /security headers scan/i });
  expect(scan).toHaveAttribute("target", "_blank");
  expect(scan.getAttribute("rel") ?? "").toContain("noopener");
});
