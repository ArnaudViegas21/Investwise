import type { FinancialGoal } from "@/lib/api/goals";
import GoalProgressBar from "@/components/GoalProgressBar";
import { getGoalProgressPercentage } from "@/lib/goal-analytics";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatProgressPercent
} from "@/lib/format";

type GoalSummaryProps = {
  goal: FinancialGoal;
};

export default function GoalSummary({ goal }: GoalSummaryProps) {
  const progress = getGoalProgressPercentage(goal);

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Goal assumptions</p>
        <h2>{goal.name}</h2>
      </div>
      <div className="goal-card-progress detail-progress">
        <div>
          <span>{formatProgressPercent(progress)} completed</span>
          <strong>{formatCurrency(goal.current_amount)} saved</strong>
        </div>
        <GoalProgressBar goal={goal} />
      </div>
      <dl className="summary-list">
        <div>
          <dt>Target amount</dt>
          <dd>{formatCurrency(goal.target_amount)}</dd>
        </div>
        <div>
          <dt>Current amount</dt>
          <dd>{formatCurrency(goal.current_amount)}</dd>
        </div>
        <div>
          <dt>Monthly contribution</dt>
          <dd>{formatCurrency(goal.monthly_contribution)}</dd>
        </div>
        <div>
          <dt>Annual return assumption</dt>
          <dd>{formatPercent(goal.annual_return_rate)}</dd>
        </div>
        <div>
          <dt>Time horizon</dt>
          <dd>{goal.years} years</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(goal.created_at)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDate(goal.updated_at)}</dd>
        </div>
      </dl>
    </section>
  );
}
