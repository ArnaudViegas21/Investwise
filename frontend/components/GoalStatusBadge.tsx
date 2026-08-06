import {
  getGoalStatusLabel,
  type GoalStatus
} from "@/lib/goal-analytics";

type GoalStatusBadgeProps = {
  status: GoalStatus;
};

export default function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  return (
    <span className="status-badge" data-status={status}>
      <span aria-hidden="true" />
      {getGoalStatusLabel(status)}
    </span>
  );
}
