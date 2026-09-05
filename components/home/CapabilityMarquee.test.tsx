import { render, screen } from "@testing-library/react";

import { CapabilityMarquee } from "./CapabilityMarquee";

test("the moving track is duplicated so the loop has no seam", () => {
  const { container } = render(<CapabilityMarquee />);
  const track = container.querySelector(".bv-marquee");
  expect(track).not.toBeNull();
  // Two identical copies: the animation slides exactly half the track's width.
  expect(track!.querySelectorAll("ul")).toHaveLength(2);
});

test("the duplicated visual is hidden from assistive tech, with one readable list behind it", () => {
  const { container } = render(<CapabilityMarquee />);
  expect(container.querySelector(".bv-marquee")).toHaveAttribute("aria-hidden");
  // Announced once, not twice, and not at all from the moving copies.
  expect(screen.getByText(/custom websites.*speed on real phones/i)).toBeInTheDocument();
});

test("names capabilities in a business owner's words, not implementation terms", () => {
  const { container } = render(<CapabilityMarquee />);
  const text = container.textContent ?? "";
  expect(text).toMatch(/online booking/i);
  expect(text).toMatch(/whatsapp agents/i);
  expect(text).not.toMatch(/webgl|shader|react|three\.js/i);
});
