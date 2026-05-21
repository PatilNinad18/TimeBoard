import React from "react";

const FILTERS = ["All", "Productive", "Distracting", "Neutral", "Idle"];

const FILTER_DOTS = {
  All: null,
  Productive: "#16a34a",
  Distracting: "#dc2626",
  Neutral: "#6b6b80",
  Idle: "#d1d1dc",
};

export default function ActivityFilters({ filter = "All", setFilter, active, onFilterChange }) {
  const current = filter ?? active;
  const change = setFilter || onFilterChange;

  return (
    <div className="activity-filters">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`af-pill ${current === f ? "active" : ""}`}
          onClick={() => change?.(f)}
        >
          {FILTER_DOTS[f] && (
            <span className="af-dot" style={{ background: FILTER_DOTS[f] }} />
          )}
          {f}
        </button>
      ))}
    </div>
  );
}
