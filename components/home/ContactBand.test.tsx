import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import { ContactBand } from "./ContactBand";

test("prompts for a project and links the CTA to /contact", () => {
  render(<ContactBand />);
  expect(
    screen.getByRole("heading", { level: 2, name: /have something in mind\?/i })
  ).toBeInTheDocument();
  const cta = screen.getByRole("link", { name: /start a project/i });
  expect(cta).toHaveAttribute("href", "/contact");
  expect(cta.className).toMatch(/\bbg-accent\b/);
  expect(cta.className).toMatch(/\btext-on-accent\b/);
});
