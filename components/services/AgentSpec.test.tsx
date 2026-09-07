import { render, screen } from "@testing-library/react";

import { AgentSpec } from "./AgentSpec";

test("names both rows so scope is distinguishable from audience", () => {
  render(<AgentSpec handles={["Pricing", "Returns"]} builtFor={["Clinics"]} />);
  // Without the labels a screen reader hears two unnamed lists of nouns and
  // cannot tell what the agent does from who it is for.
  expect(screen.getByRole("list", { name: "Handles" })).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Built for" })).toBeInTheDocument();
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Pricing",
    "Returns",
    "Clinics",
  ]);
});
