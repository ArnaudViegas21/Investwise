import PageHero from "@/components/PageHero";
import ProjectionForm from "@/components/ProjectionForm";

export default function CalculatorPage() {
  return (
    <main className="page-shell calculator-page">
      <PageHero
        description="Adjust the assumptions below to request a projection from the InvestWise API, then save the values as a named goal for review."
        eyebrow="Investment calculator"
        title="Explore a hypothetical projection"
      />

      <ProjectionForm />

      <p className="disclaimer">
        Projections are hypothetical estimates and are not guaranteed.
      </p>
    </main>
  );
}
