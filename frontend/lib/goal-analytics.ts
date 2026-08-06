import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";

export type GoalStatus = "ahead" | "on-track" | "at-risk" | "not-calculated";

export type GoalSortKey =
  | "newest"
  | "oldest"
  | "target"
  | "progress"
  | "name";

export type ProjectionLookup = Map<string, ProjectionResponse>;

export type ProjectionErrorLookup = Map<string, string>;

export type GoalDashboardSummary = {
  goalCount: number;
  combinedTargetAmount: number;
  combinedCurrentSavings: number;
  combinedProjectedBalance: number;
  totalRemainingAmount: number;
  overallProgressPercentage: number;
};

export function parseMoney(value: string | number): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function getGoalProgressPercentage(goal: FinancialGoal): number {
  const targetAmount = parseMoney(goal.target_amount);

  if (targetAmount <= 0) {
    return 0;
  }

  return Math.max(0, (parseMoney(goal.current_amount) / targetAmount) * 100);
}

export function getClampedGoalProgress(goal: FinancialGoal): number {
  return Math.min(100, getGoalProgressPercentage(goal));
}

export function getRemainingAmount(goal: FinancialGoal): number {
  return Math.max(
    0,
    parseMoney(goal.target_amount) - parseMoney(goal.current_amount)
  );
}

export function getTargetDifference(
  goal: FinancialGoal,
  projection: ProjectionResponse
): number {
  return parseMoney(projection.projected_balance) - parseMoney(goal.target_amount);
}

export function getGoalStatus(
  goal: FinancialGoal,
  projection?: ProjectionResponse
): GoalStatus {
  if (!projection) {
    return "not-calculated";
  }

  const difference = getTargetDifference(goal, projection);

  if (difference > 0) {
    return "ahead";
  }

  if (difference === 0) {
    return "on-track";
  }

  return "at-risk";
}

export function getGoalStatusLabel(status: GoalStatus): string {
  const labels: Record<GoalStatus, string> = {
    ahead: "Ahead",
    "on-track": "On track",
    "at-risk": "At risk",
    "not-calculated": "Not yet calculated"
  };

  return labels[status];
}

export function summarizeGoals(
  goals: FinancialGoal[],
  projections: ProjectionLookup
): GoalDashboardSummary {
  const combinedTargetAmount = goals.reduce(
    (total, goal) => total + parseMoney(goal.target_amount),
    0
  );
  const combinedCurrentSavings = goals.reduce(
    (total, goal) => total + parseMoney(goal.current_amount),
    0
  );
  const combinedProjectedBalance = goals.reduce((total, goal) => {
    const projection = projections.get(goal.id);
    return total + (projection ? parseMoney(projection.projected_balance) : 0);
  }, 0);
  const totalRemainingAmount = Math.max(
    0,
    combinedTargetAmount - combinedCurrentSavings
  );
  const overallProgressPercentage =
    combinedTargetAmount > 0
      ? (combinedCurrentSavings / combinedTargetAmount) * 100
      : 0;

  return {
    goalCount: goals.length,
    combinedTargetAmount,
    combinedCurrentSavings,
    combinedProjectedBalance,
    totalRemainingAmount,
    overallProgressPercentage
  };
}

export function searchGoals(
  goals: FinancialGoal[],
  searchTerm: string
): FinancialGoal[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return goals;
  }

  return goals.filter((goal) =>
    goal.name.toLowerCase().includes(normalizedTerm)
  );
}

export function filterGoalsByStatus(
  goals: FinancialGoal[],
  status: GoalStatus | "all",
  projections: ProjectionLookup
): FinancialGoal[] {
  if (status === "all") {
    return goals;
  }

  return goals.filter((goal) => getGoalStatus(goal, projections.get(goal.id)) === status);
}

export function sortGoals(
  goals: FinancialGoal[],
  sortKey: GoalSortKey
): FinancialGoal[] {
  return [...goals].sort((firstGoal, secondGoal) => {
    if (sortKey === "newest") {
      return (
        Date.parse(secondGoal.created_at) - Date.parse(firstGoal.created_at)
      );
    }

    if (sortKey === "oldest") {
      return Date.parse(firstGoal.created_at) - Date.parse(secondGoal.created_at);
    }

    if (sortKey === "target") {
      return (
        parseMoney(secondGoal.target_amount) - parseMoney(firstGoal.target_amount)
      );
    }

    if (sortKey === "progress") {
      return (
        getGoalProgressPercentage(secondGoal) -
        getGoalProgressPercentage(firstGoal)
      );
    }

    return firstGoal.name.localeCompare(secondGoal.name);
  });
}
