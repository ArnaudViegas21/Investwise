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
        <dd>${values.initialInvestment.toLocaleString()}</dd>
      </div>
      <div>
        <dt>Monthly contribution</dt>
        <dd>${values.monthlyContribution.toLocaleString()}</dd>
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

function formatCurrency(value: string): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(numericValue);
}

export default function ProjectionResults({
  resultState
}: ProjectionResultsProps) {
  if (resultState.status === "loading") {
    return (
      <section className="results-panel" aria-live="polite">
        <h2>Preparing projection</h2>
        <p>Your projection request is being prepared.</p>
        <SubmittedValues values={resultState.submittedValues} />
      </section>
    );
  }

  if (resultState.status === "ready") {
    const { projection } = resultState;

    return (
      <section className="results-panel" aria-live="polite">
        <h2>Projection results</h2>
        <dl className="submitted-values">
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

        <h3>Yearly balances</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Balance</th>
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

        <p>{projection.disclaimer}</p>
        <SubmittedValues values={resultState.submittedValues} />
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
