import { render, screen } from "@testing-library/react";

import { AgentDemo, type Turn } from "./AgentDemo";

const TURNS: Turn[] = [
  { from: "customer", text: "Where is order 4471?" },
  { from: "agent", text: "Out for delivery today.", cite: "Orders, live" },
];

test("the whole transcript is in the DOM, not withheld behind the animation", () => {
  render(<AgentDemo turns={TURNS} label="Order agent" />);
  // It is content that explains the service, so readers and search get it even
  // though the turns arrive on a stagger.
  expect(screen.getByText("Where is order 4471?")).toBeInTheDocument();
  expect(screen.getByText(/out for delivery today/i)).toBeInTheDocument();
  expect(screen.getByText("Orders, live")).toBeInTheDocument();
});

test("names itself an example, so it is not mistaken for a real exchange", () => {
  render(<AgentDemo turns={TURNS} label="Order agent" />);
  expect(screen.getByText(/example conversation: order agent/i)).toBeInTheDocument();
});

test("staggers the turns from one flag rather than one observer per bubble", () => {
  const { container } = render(<AgentDemo turns={TURNS} label="Order agent" />);
  expect(container.querySelectorAll(".bv-chat")).toHaveLength(1);
  const delays = [...container.querySelectorAll<HTMLElement>(".bv-turn")].map(
    (el) => el.style.transitionDelay
  );
  expect(delays).toEqual(["0ms", "240ms"]);
});

test("without an IntersectionObserver the turns are shown, never stranded hidden", () => {
  const original = window.IntersectionObserver;
  // @ts-expect-error -- deleting the global is the point of the test
  delete window.IntersectionObserver;
  try {
    const { container } = render(<AgentDemo turns={TURNS} label="Order agent" />);
    expect(container.querySelector(".bv-chat")).toHaveAttribute("data-shown");
  } finally {
    window.IntersectionObserver = original;
  }
});
