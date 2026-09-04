import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { HowWeBuild } from "./HowWeBuild";

test("renders all four pillars with their one-line copy", () => {
  render(<HowWeBuild />);
  for (const term of ["Craft", "Performance", "Accessible", "Secure"]) {
    expect(screen.getByText(term)).toBeInTheDocument();
  }
  expect(screen.getByText(/distinctive design, not templates\./i)).toBeInTheDocument();
  expect(screen.getByText(/fast on a mid-range phone/i)).toBeInTheDocument();
  expect(screen.getByText(/keyboard, contrast, reduced-motion/i)).toBeInTheDocument();
  expect(screen.getByText(/hardened headers, validated inputs/i)).toBeInTheDocument();
});

test("the security-headers scan opens in a new tab with rel=noopener", () => {
  render(<HowWeBuild />);
  const scan = screen.getByRole("link", { name: /security headers scan/i });
  expect(scan).toHaveAttribute("target", "_blank");
  expect(scan.getAttribute("rel") ?? "").toContain("noopener");
});
