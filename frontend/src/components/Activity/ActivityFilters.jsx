import React from "react";

const FILTERS = ["All", "Productive", "Distracting", "Idle"];

const FILTER_DOTS = {
  All: null,
  Productive: "#16a34a",
  Distracting: "#dc2626",
  Idle: "#d1d1dc",
};

export default function ActivityFilters({ active = "All", onFilterChange }) {
  return (
    <div className="activity-filters">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`af-pill ${active === f ? "active" : ""}`}
          onClick={() => onFilterChange?.(f)}
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
