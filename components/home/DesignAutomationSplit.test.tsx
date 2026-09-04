import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { DesignAutomationSplit } from "./DesignAutomationSplit";

test("links the design panel to /lab and the automation panel to /automation", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByRole("link", { name: /see the lab/i })).toHaveAttribute("href", "/lab");
  expect(screen.getByRole("link", { name: /see automation/i })).toHaveAttribute(
    "href",
    "/automation"
  );
});

test("carries each panel's heading and description", () => {
  render(<DesignAutomationSplit />);
  expect(screen.getByText(/interfaces worth looking at/i)).toBeInTheDocument();
  expect(screen.getByText(/systems that run the busywork/i)).toBeInTheDocument();
  expect(screen.getByText(/perform on a mid-range phone/i)).toBeInTheDocument();
  expect(screen.getByText(/book the appointment, chase the follow-up/i)).toBeInTheDocument();
});
