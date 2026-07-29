import ProjectionForm from "@/components/ProjectionForm";

export default function CalculatorPage() {
  return (
    <main className="page-shell calculator-page">
      <section className="page-heading">
        <p className="eyebrow">Investment calculator</p>
        <h1>Explore a hypothetical projection</h1>
        <p>
          Adjust the assumptions below to prepare a projection request. Backend
          integration will be added in a future milestone.
        </p>
      </section>

      <ProjectionForm />

      <p className="disclaimer">
        Projections are hypothetical estimates and are not guaranteed.
      </p>
    </main>
  );
}
