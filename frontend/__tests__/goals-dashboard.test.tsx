import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoalsPage from "@/app/goals/page";
import GoalCard from "@/components/GoalCard";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import { LoadingState } from "@/components/GoalStates";
import ProjectionChart from "@/components/ProjectionChart";
import ProjectionResults from "@/components/ProjectionResults";
import { ToastProvider } from "@/components/ToastProvider";
import ViewToggle from "@/components/ViewToggle";
import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";

const goals: FinancialGoal[] = [
  goal({
    id: "goal-1",
    name: "Emergency fund",
    target: "100.00",
    current: "25.00",
    created: "2026-08-01T10:00:00Z"
  }),
  goal({
    id: "goal-2",
    name: "Home deposit",
    target: "200.00",
    current: "80.00",
    created: "2026-08-02T10:00:00Z"
  }),
  goal({
    id: "goal-3",
    name: "Retirement",
    target: "300.00",
    current: "30.00",
    created: "2026-08-03T10:00:00Z"
  })
];

const projections: Record<string, ProjectionResponse> = {
  "goal-1": projection("120.00"),
  "goal-2": projection("200.00"),
  "goal-3": projection("250.00")
};

vi.mock("recharts", () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Line: () => <div data-testid="line" />,
  LineChart: ({
    children,
    data
  }: {
    children: ReactNode;
    data: { year: number; balance: number }[];
  }) => <div data-points={data.length}>{children}</div>,
  ReferenceLine: () => <div data-testid="reference-line" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />
}));

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("goals dashboard", () => {
  it("search filters results and renders an empty search state", async () => {
    mockGoalsFetch();
    renderGoalsPage();

    await screen.findByRole("heading", { name: "Emergency fund" });
    fireEvent.change(screen.getByLabelText("Search goals"), {
      target: { value: "home" }
    });

    expect(screen.getByRole("heading", { name: "Home deposit" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Emergency fund" })).toBeNull();

    fireEvent.change(screen.getByLabelText("Search goals"), {
      target: { value: "not here" }
    });
    expect(
      screen.getByRole("heading", { name: "No goals match your search" })
    ).toBeVisible();
  });

  it("sort selection changes order", async () => {
    mockGoalsFetch();
    renderGoalsPage();

    await screen.findByRole("heading", { name: "Emergency fund" });
    fireEvent.change(screen.getByLabelText("Sort goals"), {
      target: { value: "target" }
    });

    expect(visibleGoalHeadings()).toEqual([
      "Retirement",
      "Home deposit",
      "Emergency fund"
    ]);
  });

  it("status filter changes visible goals", async () => {
    mockGoalsFetch();
    renderGoalsPage();

    fireEvent.click(await screen.findByRole("button", { name: "At risk" }));

    expect(screen.getByRole("heading", { name: "Retirement" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Home deposit" })).toBeNull();
  });

  it("card and list view toggle works and persists", async () => {
    mockGoalsFetch();
    renderGoalsPage();

    await screen.findByRole("heading", { name: "Emergency fund" });
    fireEvent.click(screen.getByRole("button", { name: "List" }));

    await waitFor(() =>
      expect(window.localStorage.getItem("investwise-goals-view")).toBe("list")
    );
    expect(screen.getAllByRole("link", { name: "View" })).toHaveLength(3);
  });

  it("renders a toast when a projection API request fails", async () => {
    mockGoalsFetch(["goal-2"]);
    renderGoalsPage();

    expect(
      await screen.findByText("Projection summaries incomplete")
    ).toBeVisible();
    expect(screen.getByText(/projection request could not be loaded/i)).toBeVisible();
  });
});

describe("goal UI primitives", () => {
  it("displays goal progress percentage", () => {
    render(
      <GoalCard goal={goals[0]} projection={projections["goal-1"]} />
    );

    expect(screen.getByText("25% completed")).toBeVisible();
  });

  it("renders goal status labels", () => {
    render(
      <div>
        <GoalStatusBadge status="ahead" />
        <GoalStatusBadge status="on-track" />
        <GoalStatusBadge status="at-risk" />
      </div>
    );

    expect(screen.getByText("Ahead")).toBeVisible();
    expect(screen.getByText("On track")).toBeVisible();
    expect(screen.getByText("At risk")).toBeVisible();
  });

  it("renders loading skeletons", () => {
    render(
      <LoadingState message="Loading saved goals." title="Loading saved goals" />
    );

    expect(screen.getAllByTestId("loading-skeleton")).toHaveLength(3);
  });

  it("keeps reduced-motion interactions functional", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        removeEventListener: vi.fn()
      }))
    );
    const onChange = vi.fn();

    render(<ViewToggle value="cards" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "List" }));

    expect(onChange).toHaveBeenCalledWith("list");
  });
});

describe("calculator result actions", () => {
  it("passes backend yearly balance data into the projection chart", () => {
    render(
      <ProjectionChart
        targetAmount="12000.00"
        yearlyBalances={[
          { balance: "11000.00", year: 1 },
          { balance: "12000.00", year: 2 },
          { balance: "13200.00", year: 3 }
        ]}
      />
    );

    expect(screen.getByText("Projected yearly balance")).toBeVisible();
    expect(screen.getByTestId("line")).toBeInTheDocument();
    expect(
      document.querySelector("[data-points='3']")
    ).toBeInTheDocument();
  });

  it("includes calculator values in Save as goal navigation", () => {
    render(
      <ProjectionResults
        resultState={{
          projection: projection("15000.00"),
          status: "ready",
          submittedValues: {
            annualReturn: 6.5,
            initialInvestment: 4500,
            monthlyContribution: 300,
            years: 12
          }
        }}
      />
    );

    const link = screen.getByRole("link", { name: "Save as goal" });
    expect(link).toHaveAttribute(
      "href",
      "/goals/new?currentAmount=4500&monthlyContribution=300&annualReturnRate=6.5&years=12"
    );
  });
});

function renderGoalsPage() {
  render(
    <ToastProvider>
      <GoalsPage />
    </ToastProvider>
  );
}

function mockGoalsFetch(failingProjectionIds: string[] = []) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/api/v1/goals")) {
        return Response.json(goals);
      }

      const matchedGoal = goals.find((currentGoal) =>
        url.endsWith(`/api/v1/goals/${currentGoal.id}/projection`)
      );

      if (!matchedGoal) {
        return Response.json({}, { status: 404 });
      }

      if (failingProjectionIds.includes(matchedGoal.id)) {
        return Response.json({ detail: "Projection failed" }, { status: 503 });
      }

      return Response.json(projections[matchedGoal.id]);
    })
  );
}

function visibleGoalHeadings(): string[] {
  const goalsRegion = screen.getByLabelText("Saved goals");
  return within(goalsRegion)
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent ?? "");
}

function goal({
  id,
  name,
  target,
  current,
  created
}: {
  id: string;
  name: string;
  target: string;
  current: string;
  created: string;
}): FinancialGoal {
  return {
    annual_return_rate: "5.0000",
    created_at: created,
    current_amount: current,
    id,
    monthly_contribution: "50.00",
    name,
    target_amount: target,
    updated_at: created,
    years: 5
  };
}

function projection(projectedBalance: string): ProjectionResponse {
  return {
    disclaimer: "Projections are hypothetical estimates and are not guaranteed.",
    estimated_growth: "20.00",
    projected_balance: projectedBalance,
    total_contributions: "100.00",
    yearly_balances: [
      { balance: "50.00", year: 1 },
      { balance: projectedBalance, year: 2 }
    ]
  };
}
