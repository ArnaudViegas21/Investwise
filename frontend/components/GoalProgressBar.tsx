import type { FinancialGoal } from "@/lib/api/goals";
import { getClampedGoalProgress, getGoalProgressPercentage } from "@/lib/goal-analytics";
import { formatProgressPercent } from "@/lib/format";

type GoalProgressBarProps = {
  goal: FinancialGoal;
};

export default function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const displayPercent = getGoalProgressPercentage(goal);
  const clampedPercent = getClampedGoalProgress(goal);

  return (
    <div
      aria-label={`${formatProgressPercent(displayPercent)} completed`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(clampedPercent)}
      className="goal-progress"
      role="progressbar"
    >
      <span style={{ width: `${clampedPercent}%` }} />
    </div>
  );
}
