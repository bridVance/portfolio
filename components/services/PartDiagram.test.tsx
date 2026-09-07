import { render } from "@testing-library/react";

import { PartDiagram } from "./PartDiagram";

const TERMS = ["Channels", "Your systems", "Retrieval", "Evaluation", "Interface kit"];

test.each(TERMS)("renders a diagram for %s", (term) => {
  const { container } = render(<PartDiagram term={term} />);
  expect(container.querySelector("svg")).not.toBeNull();
});

test("unknown terms render nothing rather than an empty frame", () => {
  const { container } = render(<PartDiagram term="Not a part" />);
  expect(container.firstChild).toBeNull();
});

test.each(TERMS)("every shape in %s has a real size", (term) => {
  const { container } = render(<PartDiagram term={term} />);
  // A rect given w/h instead of width/height still renders — at zero size, so
  // the diagram silently comes out blank. Catch it here rather than on the page.
  for (const rect of container.querySelectorAll("rect")) {
    expect(Number(rect.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(rect.getAttribute("height"))).toBeGreaterThan(0);
  }
  for (const path of container.querySelectorAll("path")) {
    expect(path.getAttribute("d")).toMatch(/\d/);
  }
});

test("diagrams are decorative, so they stay out of the accessibility tree", () => {
  const { container } = render(<PartDiagram term="Channels" />);
  expect(container.firstElementChild).toHaveAttribute("aria-hidden");
});
