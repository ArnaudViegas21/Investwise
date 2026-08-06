"use client";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="search-input">
      <label htmlFor="goal-search">Search goals</label>
      <input
        id="goal-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by goal name"
        type="search"
        value={value}
      />
    </div>
  );
}
