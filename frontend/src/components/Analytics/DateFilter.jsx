import { useState } from "react";
import React from "react";
import { Calendar, Plus } from "lucide-react";

const PRESETS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Month"];

export default function DateFilter({ selected = "Last 7 days", onFilterChange }) {
  const [active, setActive] = useState(selected);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const select = (p) => {
    setActive(p);
    setCustomOpen(false);
    onFilterChange?.(p);
  };

  const applyCustom = () => {
    if (from && to) {
      const label = `${from} → ${to}`;
      setActive(label);
      setCustomOpen(false);
      onFilterChange?.({ from, to });
    }
  };

  return (
    <div className="date-filter">
      <div className="filter-pills">
        {PRESETS.map((p) => (
          <button
            key={p}
            className={`filter-pill ${active === p ? "active" : ""}`}
            onClick={() => select(p)}
          >
            {p === "Today" && <span className="pill-dot" />}
            {p}
          </button>
        ))}

        <button
          className={`filter-pill custom-pill ${customOpen ? "active" : ""}`}
          onClick={() => setCustomOpen(!customOpen)}
        >
          <Calendar size={12} />
          Custom dates
        </button>

        <button className="filter-pill add-pill" onClick={() => {}}>
          <Plus size={12} /> Add+
        </button>
      </div>

      {customOpen && (
        <div className="custom-date-popup">
          <div className="date-inputs">
            <div className="date-field">
              <label>From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <span className="date-sep">→</span>
            <div className="date-field">
              <label>To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <button className="apply-dates-btn" onClick={applyCustom}>Apply</button>
        </div>
      )}
    </div>
  );
}
