import Link from "next/link";
import ProjectionChart from "@/components/ProjectionChart";
import SkeletonCard from "@/components/SkeletonCard";
import { formatCurrency } from "@/lib/format";
import type {
  ProjectionFormValues,
  ProjectionResultState
} from "@/types/projections";

type ProjectionResultsProps = {
  resultState: ProjectionResultState;
};

function SubmittedValues({ values }: { values: ProjectionFormValues }) {
  return (
    <dl className="submitted-values">
      <div>
        <dt>Initial investment</dt>
        <dd>{formatCurrency(values.initialInvestment)}</dd>
      </div>
      <div>
        <dt>Monthly contribution</dt>
        <dd>{formatCurrency(values.monthlyContribution)}</dd>
      </div>
      <div>
        <dt>Estimated annual return</dt>
        <dd>{values.annualReturn}%</dd>
      </div>
      <div>
        <dt>Investment period</dt>
        <dd>{values.years} years</dd>
      </div>
    </dl>
  );
}

function getSaveGoalHref(values: ProjectionFormValues): string {
  const params = new URLSearchParams({
    currentAmount: String(values.initialInvestment),
    monthlyContribution: String(values.monthlyContribution),
    annualReturnRate: String(values.annualReturn),
    years: String(values.years)
  });

  return `/goals/new?${params.toString()}`;
}

export default function ProjectionResults({
  resultState
}: ProjectionResultsProps) {
  if (resultState.status === "loading") {
    return (
      <section className="results-panel" aria-live="polite">
        <h2>Preparing projection</h2>
        <p>Your projection request is being prepared.</p>
        <SkeletonCard variant="chart" />
        <SubmittedValues values={resultState.submittedValues} />
      </section>
    );
  }

  if (resultState.status === "ready") {
    const { projection } = resultState;

    return (
      <section className="results-panel" aria-live="polite">
        <h2>Projection results</h2>
        <dl className="submitted-values results-grid">
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
        </dl>

        <ProjectionChart
          title="Calculator projection"
          yearlyBalances={projection.yearly_balances}
        />

        <div className="breakdown-grid" aria-label="Contribution versus growth">
          <article>
            <span>Total contributions</span>
            <strong>{formatCurrency(projection.total_contributions)}</strong>
          </article>
          <article>
            <span>Estimated growth</span>
            <strong>{formatCurrency(projection.estimated_growth)}</strong>
          </article>
        </div>

        <p className="disclaimer">{projection.disclaimer}</p>
        <SubmittedValues values={resultState.submittedValues} />
        <Link
          className="button button-primary"
          href={getSaveGoalHref(resultState.submittedValues)}
        >
          Save as goal
        </Link>
      </section>
    );
  }

  if (resultState.status === "error") {
    return (
      <section className="results-panel" aria-live="polite">
        <h2>Projection unavailable</h2>
        <p>{resultState.message}</p>
        <SubmittedValues values={resultState.submittedValues} />
      </section>
    );
  }

  return (
    <section className="results-panel results-panel-empty" aria-live="polite">
      <h2>Projection results</h2>
      <p>Submit valid assumptions to prepare a projection preview.</p>
    </section>
  );
}
