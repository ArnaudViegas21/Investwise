import Link from "next/link";
import GoalProgressBar from "@/components/GoalProgressBar";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";
import {
  getGoalProgressPercentage,
  getGoalStatus,
  getRemainingAmount
} from "@/lib/goal-analytics";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatProgressPercent
} from "@/lib/format";

type GoalCardProps = {
  goal: FinancialGoal;
  projection?: ProjectionResponse;
  projectionError?: string;
};

export default function GoalCard({
  goal,
  projection,
  projectionError
}: GoalCardProps) {
  const status = getGoalStatus(goal, projection);
  const progressPercentage = getGoalProgressPercentage(goal);

  return (
    <article className="goal-card">
      <div className="goal-card-header">
        <div>
          <h2>
            <Link href={`/goals/${goal.id}`}>{goal.name}</Link>
          </h2>
          <span>Updated {formatDate(goal.updated_at || goal.created_at)}</span>
        </div>
        <GoalStatusBadge status={status} />
      </div>

      <div className="goal-card-progress">
        <div>
          <span>{formatProgressPercent(progressPercentage)} completed</span>
          <strong>{formatCurrency(getRemainingAmount(goal))} remaining</strong>
        </div>
        <GoalProgressBar goal={goal} />
      </div>

      <dl className="metric-grid">
        <div>
          <dt>Target</dt>
          <dd>{formatCurrency(goal.target_amount)}</dd>
        </div>
        <div>
          <dt>Current</dt>
          <dd>{formatCurrency(goal.current_amount)}</dd>
        </div>
        <div>
          <dt>Monthly</dt>
          <dd>{formatCurrency(goal.monthly_contribution)}</dd>
        </div>
        <div>
          <dt>Return</dt>
          <dd>{formatPercent(goal.annual_return_rate)}</dd>
        </div>
        <div>
          <dt>Horizon</dt>
          <dd>{goal.years} years</dd>
        </div>
        <div>
          <dt>Projected</dt>
          <dd>
            {projection
              ? formatCurrency(projection.projected_balance)
              : "Not loaded"}
          </dd>
        </div>
      </dl>

      {projectionError ? (
        <p className="inline-alert" role="alert">
          Projection unavailable: {projectionError}
        </p>
      ) : null}

      <div className="card-actions">
        <Link className="button button-secondary" href={`/goals/${goal.id}`}>
          View details
        </Link>
        <Link
          className="button button-ghost"
          href={`/goals/${goal.id}/edit`}
        >
          Edit
        </Link>
      </div>
    </article>
  );
}
