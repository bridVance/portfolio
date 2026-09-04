import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { Thesis } from "./Thesis";

test("states the studio thesis in one sentence, inside a named landmark", () => {
  render(<Thesis />);
  expect(
    screen.getByText(
      /we design the surface people touch, and build the automation running behind it\./i
    )
  ).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /what bridvance does/i })).toBeInTheDocument();
});
