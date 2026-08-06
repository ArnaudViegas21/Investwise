import type { FinancialGoal, ProjectionResponse } from "@/lib/api/goals";
import ProjectionChart from "@/components/ProjectionChart";
import {
  getGoalProgressPercentage,
  getGoalStatus,
  getGoalStatusLabel,
  getRemainingAmount,
  getTargetDifference
} from "@/lib/goal-analytics";
import {
  formatCurrency,
  formatProgressPercent,
  formatSignedCurrency
} from "@/lib/format";

type ProjectionSummaryProps = {
  goal: FinancialGoal;
  projection: ProjectionResponse;
};

export default function ProjectionSummary({
  goal,
  projection
}: ProjectionSummaryProps) {
  const difference = getTargetDifference(goal, projection);
  const status = getGoalStatus(goal, projection);
  const differenceLabel =
    difference >= 0
      ? `${formatCurrency(difference)} above target`
      : `${formatCurrency(Math.abs(difference))} below target`;
  const currentProgress = getGoalProgressPercentage(goal);

  return (
    <section className="panel projection-detail-panel">
      <div className="section-heading">
        <p className="eyebrow">Projection</p>
        <h2>Projected status: {getGoalStatusLabel(status)}</h2>
      </div>

      <dl className="summary-list projection-metrics">
        <div>
          <dt>Projected balance</dt>
          <dd>{formatCurrency(projection.projected_balance)}</dd>
        </div>
        <div>
          <dt>Total contributions</dt>
          <dd>{formatCurrency(projection.total_contributions)}</dd>
        </div>
        <div>
          <dt>Estimated growth</dt>
          <dd>{formatCurrency(projection.estimated_growth)}</dd>
        </div>
        <div>
          <dt>Target amount</dt>
          <dd>{formatCurrency(goal.target_amount)}</dd>
        </div>
        <div>
          <dt>Remaining amount</dt>
          <dd>{formatCurrency(getRemainingAmount(goal))}</dd>
        </div>
        <div>
          <dt>Target gap or surplus</dt>
          <dd>{differenceLabel}</dd>
        </div>
      </dl>

      <p className="status-note" data-status={status}>
        Projection status: {getGoalStatusLabel(status)}. Difference:{" "}
        {differenceLabel}.
      </p>

      <div className="insight-grid" aria-label="Projection insights">
        <article>
          <span>Projection insight</span>
          <p>
            You are projected to{" "}
            {difference >= 0
              ? `exceed your target by ${formatCurrency(difference)}`
              : `fall short by ${formatCurrency(Math.abs(difference))}`}
            .
          </p>
        </article>
        <article>
          <span>Current progress</span>
          <p>
            Your current savings represent{" "}
            {formatProgressPercent(currentProgress)} of your target.
          </p>
        </article>
        <article>
          <span>Projected balance</span>
          <p>
            At the current contribution level, the backend projection reaches{" "}
            {formatCurrency(projection.projected_balance)}.
          </p>
        </article>
        <article>
          <span>Target difference</span>
          <p>The projected target difference is {formatSignedCurrency(difference)}.</p>
        </article>
      </div>

      <ProjectionChart
        targetAmount={goal.target_amount}
        yearlyBalances={projection.yearly_balances}
      />

      <div className="table-wrap">
        <table>
          <caption>Projected yearly balances</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Projected balance</th>
            </tr>
          </thead>
          <tbody>
            {projection.yearly_balances.map((entry) => (
              <tr key={entry.year}>
                <td>{entry.year}</td>
                <td>{formatCurrency(entry.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="disclaimer">{projection.disclaimer}</p>
    </section>
  );
}
