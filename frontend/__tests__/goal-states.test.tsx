import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState, ErrorState } from "@/components/GoalStates";

describe("goals states", () => {
  it("renders the goals empty state", () => {
    render(
      <EmptyState
        message="Create a goal to save assumptions."
        title="No goals saved yet"
      />
    );

    expect(
      screen.getByRole("heading", { name: "No goals saved yet" })
    ).toBeInTheDocument();
    expect(screen.getByText("Create a goal to save assumptions.")).toBeVisible();
  });

  it("renders a concise API error state", () => {
    render(
      <ErrorState
        message="The database is temporarily unavailable. Please try again in a moment."
        title="Saved goals are unavailable"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Saved goals are unavailable" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The database is temporarily unavailable. Please try again in a moment."
      )
    ).toBeVisible();
  });
});
