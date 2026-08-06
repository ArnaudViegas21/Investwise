type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "success" | "warning";
};

export default function StatCard({
  label,
  value,
  detail,
  tone = "neutral"
}: StatCardProps) {
  return (
    <article className="stat-card" data-tone={tone}>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail ? <span>{detail}</span> : null}
    </article>
  );
}
