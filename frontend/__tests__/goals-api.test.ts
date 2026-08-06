import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GoalsApiError,
  fetchGoals,
  type FinancialGoal
} from "@/lib/api/goals";

const sampleGoal: FinancialGoal = {
  id: "goal-1",
  name: "Emergency fund",
  target_amount: "12000.00",
  current_amount: "2500.00",
  monthly_contribution: "350.00",
  annual_return_rate: "4.5000",
  years: 3,
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-08-02T10:00:00Z"
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("goals api", () => {
  it("parses a successful goals response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([sampleGoal]))
    );

    await expect(fetchGoals()).resolves.toEqual([sampleGoal]);
  });

  it("returns a readable database unavailable message for HTTP 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ status: "unavailable" }, { status: 503 })
      )
    );

    await expect(fetchGoals()).rejects.toMatchObject<Partial<GoalsApiError>>({
      kind: "database_unavailable",
      message:
        "The database is temporarily unavailable. Please try again in a moment.",
      status: 503
    });
  });
});
