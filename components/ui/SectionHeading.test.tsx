import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./SectionHeading";

test("renders the mono label, a mark svg, and the heading at the given level + id", () => {
  const { container } = render(
    <SectionHeading label="What we do" as="h2" id="what">
      Two halves of one studio
    </SectionHeading>
  );
  expect(screen.getByText("What we do")).toBeInTheDocument();
  expect(container.querySelector("svg")).not.toBeNull();
  const h = screen.getByRole("heading", { level: 2, name: "Two halves of one studio" });
  expect(h).toHaveAttribute("id", "what");
});

test("defaults to h2, honours as='h3'", () => {
  render(<SectionHeading label="x" as="h3">Sub</SectionHeading>);
  expect(screen.getByRole("heading", { level: 3, name: "Sub" })).toBeInTheDocument();
});
