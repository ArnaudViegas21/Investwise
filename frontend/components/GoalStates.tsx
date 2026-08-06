import SkeletonCard from "@/components/SkeletonCard";

type LoadingStateProps = {
  title: string;
  message: string;
  skeletonCount?: number;
};

export function LoadingState({
  title,
  message,
  skeletonCount = 3
}: LoadingStateProps) {
  return (
    <section aria-live="polite" aria-busy="true">
      <div className="state-panel">
        <p className="state-kicker">Loading</p>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <div className="skeleton-grid">
        <SkeletonCard count={skeletonCount} />
      </div>
    </section>
  );
}

type EmptyStateProps = {
  title: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <section className="state-panel empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="state-kicker">No saved goals</p>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="example-tags" aria-label="Example goal categories">
        <span>Emergency fund</span>
        <span>Home deposit</span>
        <span>Retirement</span>
      </div>
      {action}
    </section>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <section className="state-panel state-panel-error" aria-live="assertive">
      <p className="state-kicker">Unavailable</p>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <button className="button button-secondary" onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </section>
  );
}
