type SkeletonCardProps = {
  variant?: "card" | "detail" | "chart";
  count?: number;
};

export default function SkeletonCard({
  variant = "card",
  count = 1
}: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <article
          aria-label="Loading content"
          aria-live="polite"
          className="skeleton-card"
          data-testid="loading-skeleton"
          data-variant={variant}
          key={index}
        >
          <span />
          <span />
          <span />
          <span />
        </article>
      ))}
    </>
  );
}
