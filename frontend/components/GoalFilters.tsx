"use client";

import type { GoalSortKey, GoalStatus } from "@/lib/goal-analytics";

type GoalFiltersProps = {
  status: GoalStatus | "all";
  sortKey: GoalSortKey;
  availableStatuses: GoalStatus[];
  onStatusChange: (status: GoalStatus | "all") => void;
  onSortChange: (sortKey: GoalSortKey) => void;
};

const sortOptions: { label: string; value: GoalSortKey }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Target amount", value: "target" },
  { label: "Current progress", value: "progress" },
  { label: "Name", value: "name" }
];

const statusLabels: Record<GoalStatus | "all", string> = {
  all: "All",
  ahead: "Ahead",
  "on-track": "On track",
  "at-risk": "At risk",
  "not-calculated": "Not calculated"
};

export default function GoalFilters({
  status,
  sortKey,
  availableStatuses,
  onStatusChange,
  onSortChange
}: GoalFiltersProps) {
  return (
    <div className="goal-filter-bar">
      <label>
        <span>Sort by</span>
        <select
          aria-label="Sort goals"
          onChange={(event) => onSortChange(event.target.value as GoalSortKey)}
          value={sortKey}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="status-filter" aria-label="Filter by projection status">
        <button
          aria-pressed={status === "all"}
          onClick={() => onStatusChange("all")}
          type="button"
        >
          All
        </button>
        {availableStatuses.map((availableStatus) => (
          <button
            aria-pressed={status === availableStatus}
            key={availableStatus}
            onClick={() => onStatusChange(availableStatus)}
            type="button"
          >
            {statusLabels[availableStatus]}
          </button>
        ))}
      </div>
    </div>
  );
}
