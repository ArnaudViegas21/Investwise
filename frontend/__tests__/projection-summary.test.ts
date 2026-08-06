import { describe, expect, it } from "vitest";
import {
  getGoalStatus,
  type GoalStatus
} from "@/lib/goal-analytics";
import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";

const baseGoal: FinancialGoal = {
  id: "goal-1",
  name: "Education fund",
  target_amount: "10000.00",
  current_amount: "1000.00",
  monthly_contribution: "100.00",
  annual_return_rate: "5.0000",
  years: 5,
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-08-01T10:00:00Z"
};

function projection(projectedBalance: string): ProjectionResponse {
  return {
    projected_balance: projectedBalance,
    total_contributions: "7000.00",
    estimated_growth: "1500.00",
    yearly_balances: [{ year: 1, balance: projectedBalance }],
    disclaimer: "Projections are hypothetical estimates and are not guaranteed."
  };
}

describe("goal projection status", () => {
  it.each<[string, GoalStatus]>([
    ["12000.00", "ahead"],
    ["10000.00", "on-track"],
    ["8500.00", "at-risk"]
  ])("classifies %s against the target", (balance, expectedStatus) => {
    expect(getGoalStatus(baseGoal, projection(balance))).toBe(expectedStatus);
  });
});
