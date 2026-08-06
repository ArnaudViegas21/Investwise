"use client";

export type GoalsViewMode = "cards" | "list";

type ViewToggleProps = {
  value: GoalsViewMode;
  onChange: (value: GoalsViewMode) => void;
};

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="segmented-control" aria-label="Goal view preference">
      <button
        aria-pressed={value === "cards"}
        onClick={() => onChange("cards")}
        type="button"
      >
        Cards
      </button>
      <button
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        type="button"
      >
        List
      </button>
    </div>
  );
}
