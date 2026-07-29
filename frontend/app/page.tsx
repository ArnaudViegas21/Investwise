import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell landing-page">
      <section className="hero">
        <p className="eyebrow">Educational planning</p>
        <h1>InvestWise</h1>
        <p className="hero-copy">
          An educational investing planner for exploring hypothetical long-term
          growth.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/calculator">
            Open calculator
          </Link>
        </div>
      </section>

      <section className="notice" aria-label="Investment advice notice">
        <strong>Important notice:</strong> InvestWise does not provide
        investment advice.
      </section>
    </main>
  );
}
