import Link from "next/link";
import GoalProgressBar from "@/components/GoalProgressBar";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";
import {
  getGoalProgressPercentage,
  getGoalStatus
} from "@/lib/goal-analytics";
import {
  formatCurrency,
  formatDate,
  formatProgressPercent
} from "@/lib/format";

type GoalListRowProps = {
  goal: FinancialGoal;
  projection?: ProjectionResponse;
  projectionError?: string;
};

export default function GoalListRow({
  goal,
  projection,
  projectionError
}: GoalListRowProps) {
  const status = getGoalStatus(goal, projection);
  const progress = getGoalProgressPercentage(goal);

  return (
    <article className="goal-list-row">
      <div className="goal-list-title">
        <h2>
          <Link href={`/goals/${goal.id}`}>{goal.name}</Link>
        </h2>
        <span>Updated {formatDate(goal.updated_at || goal.created_at)}</span>
      </div>
      <GoalStatusBadge status={status} />
      <div className="goal-list-progress">
        <span>{formatProgressPercent(progress)}</span>
        <GoalProgressBar goal={goal} />
      </div>
      <dl className="goal-list-metrics">
        <div>
          <dt>Target</dt>
          <dd>{formatCurrency(goal.target_amount)}</dd>
        </div>
        <div>
          <dt>Projected</dt>
          <dd>
            {projection
              ? formatCurrency(projection.projected_balance)
              : projectionError
                ? "Unavailable"
                : "Loading"}
          </dd>
        </div>
      </dl>
      <div className="card-actions">
        <Link className="button button-secondary" href={`/goals/${goal.id}`}>
          View
        </Link>
        <Link className="button button-ghost" href={`/goals/${goal.id}/edit`}>
          Edit
        </Link>
      </div>
    </article>
  );
}
