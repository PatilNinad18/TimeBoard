import React from "react";
import { useState } from "react";

const DEFAULT_DATA = [
  { label: "Productive", value: 0, color: "#F5C518" },
  { label: "Distracting", value: 0, color: "#4B4B5A" },
  { label: "Idle", value: 0, color: "#D1D1DC" },
];

function DonutChart({ data, size = 200, thickness = 44 }) {
  const [hovered, setHovered] = useState(null);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);

  let offset = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...d, dash, gap, offset: offset * circ };
    offset += pct;
    return slice;
  });

  const center = data[0];

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* bg ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={hovered === i ? thickness + 6 : thickness}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="700" fontFamily="DM Mono, monospace">
          {hovered !== null ? `${data[hovered].value}%` : `${center.value}%`}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontFamily="DM Sans, sans-serif">
          {hovered !== null ? data[hovered].label : center.label}
        </text>
      </svg>
    </div>
  );
}

export default function TimeDistribution({ data = DEFAULT_DATA, showDates = false, onToggleDates }) {
  const productive = data.find(d => d.label === "Productive");
  const distracting = data.find(d => d.label === "Distracting");
  const idle = data.find(d => d.label === "Idle");

  return (
    <div className="analytics-card time-distribution">
      <div className="card-header">
        <h3 className="section-title">Time Distribution</h3>
        <button className="dates-toggle" onClick={onToggleDates}>
          <span className="dates-icon">📅</span> Dates
        </button>
      </div>

      <div className="donut-section">
        <div className="donut-axis-labels">
          <span style={{ color: "#D1D1DC" }}>{idle ? idle.value : 0}%</span>
        </div>
        <DonutChart data={data} />
        <div className="donut-pct-labels">
          <span style={{ color: "#4B4B5A" }}>{distracting ? distracting.value : 0}%</span>
          <span style={{ color: "#F5C518" }}>{productive ? productive.value : 0}%</span>
        </div>
      </div>

      <div className="donut-legend">
        {data.map((d) => (
          <div key={d.label} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
