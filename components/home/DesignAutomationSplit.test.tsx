import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { DesignAutomationSplit } from "./DesignAutomationSplit";

test("links the intelligence panel to /services and the interface panel to /lab", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByRole("link", { name: /see it in motion/i })).toHaveAttribute(
    "href",
    "/lab"
  );
  expect(screen.getByRole("link", { name: /see what they handle/i })).toHaveAttribute(
    "href",
    "/services"
  );
});

test("each panel carries its heading", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByText(/surfaces worth using/i)).toBeInTheDocument();
  expect(screen.getByText(/agents that carry the work/i)).toBeInTheDocument();
});

test("each panel names who it is for, in plain language", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByText(/for businesses that look like everyone else/i)).toBeInTheDocument();
  expect(
    screen.getByText(/for teams answering the same questions all day/i)
  ).toBeInTheDocument();
});

test("each panel shows its decorative visual instead of prose", () => {
  const { container } = render(<DesignAutomationSplit />);
  // Design panel: the miniature site frame (its page carries the scroll class).
  expect(container.querySelector(".bv-scroll")).not.toBeNull();
  // Automation panel: the workflow graph, with animated connectors.
  expect(container.querySelector("svg")).not.toBeNull();
  expect(container.querySelectorAll(".bv-flow").length).toBeGreaterThan(0);
});

test("keeps implementation jargon out of the panels — the audience is a business owner", () => {
  render(<DesignAutomationSplit />);
  expect(screen.queryByText(/webgl/i)).toBeNull();
  expect(screen.queryByText(/shader/i)).toBeNull();
});
