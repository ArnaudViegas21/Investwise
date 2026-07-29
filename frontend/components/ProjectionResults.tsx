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
    return (
      <section className="results-panel" aria-live="polite">
        <h2>Projection results</h2>
        <p>Your projection results will appear here after backend integration.</p>
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
