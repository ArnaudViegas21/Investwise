import Link from "next/link";
import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <main className="page-shell landing-page">
      <section className="landing-hero">
        <div className="hero">
          <p className="eyebrow">Educational planning</p>
          <h1>InvestWise</h1>
          <p className="hero-copy">
            Model long-term savings goals, save your assumptions, and review
            projection outcomes from a connected API.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/calculator">
              Calculate projection
            </Link>
            <Link className="button button-secondary" href="/goals/new">
              Create a goal
            </Link>
          </div>
        </div>

        <div className="landing-preview" aria-label="Static dashboard preview">
          <StatCard label="Demo goals" value="3" detail="Static preview data" />
          <StatCard label="Saved progress" value="42%" tone="success" />
          <article className="preview-card">
            <span>Home deposit</span>
            <strong>EUR 38,400 projected</strong>
            <div className="mini-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
        </div>
      </section>

      <section className="feature-grid" aria-label="InvestWise features">
        <article>
          <h2>Plan named goals</h2>
          <p>
            Save targets, current savings, monthly contributions, return
            assumptions, and timelines in one place.
          </p>
        </article>
        <article>
          <h2>Review projections</h2>
          <p>
            Projection balances and yearly data come from the backend, keeping
            the frontend focused on presentation.
          </p>
        </article>
        <article>
          <h2>Compare outcomes</h2>
          <p>
            Search, sort, filter by status, and switch views without storing
            financial values locally.
          </p>
        </article>
      </section>

      <section className="process-band" aria-label="How projections work">
        <div>
          <p className="eyebrow">How projections work</p>
          <h2>Assumptions in, hypothetical yearly balances out.</h2>
        </div>
        <p>
          Enter a starting amount, monthly contribution, return assumption, and
          horizon. InvestWise sends those values to the API and displays the
          returned projection data for educational planning.
        </p>
      </section>

      <section className="notice" aria-label="Investment advice notice">
        <strong>Important notice:</strong> InvestWise provides educational
        projections only and does not provide investment advice.
      </section>
    </main>
  );
}
