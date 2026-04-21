import React from "react";

export default function WorkQuality({ data, accentColor }) {
  const {
    deepWorkPct    = 0,
    shallowWorkPct = 0,
    totalMinutes   = 0,
    deepWorkTime   = 0,
    shallowWorkTime = 0,
  } = data || {};

  const fmt = (m) => {
    const h = Math.floor(m / 60);
    const min = Math.round(m % 60);
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  return (
    <div className="analytics-card work-quality-card">
      <div className="card-header">
        <div className="header-left">
          <h3 className="section-num">7.</h3>
          <h3 className="section-title">Work Quality</h3>
        </div>
        <span className="card-filename" style={{
          fontSize: "0.72rem",
          fontFamily: "DM Mono, monospace",
          color: "var(--text-tertiary)",
          background: "var(--surface-2)",
          padding: "3px 8px",
          borderRadius: 6,
          border: "1px solid var(--border)",
        }}>
          Total: {fmt(totalMinutes)}
        </span>
      </div>

      <div className="wq-grid">
        {/* Deep Work */}
        <div className="wq-stat">
          <div className="wq-label">
            <span className="wq-dot" style={{ background: accentColor }} />
            Deep Work
            <span className="wq-sub">≥ 25 min sessions</span>
          </div>
          <div className="wq-value" style={{ color: accentColor }}>
            {deepWorkPct}%
          </div>
          <div className="wq-bar-track">
            <div
              className="wq-bar-fill"
              style={{ width: `${deepWorkPct}%`, background: accentColor }}
            />
          </div>
          <div className="wq-time">{fmt(deepWorkTime)}</div>
        </div>

        {/* Shallow Work */}
        <div className="wq-stat">
          <div className="wq-label">
            <span className="wq-dot" style={{ background: "#6b6b80" }} />
            Shallow Work
            <span className="wq-sub">2 – 24 min sessions</span>
          </div>
          <div className="wq-value" style={{ color: "var(--text-secondary)" }}>
            {shallowWorkPct}%
          </div>
          <div className="wq-bar-track">
            <div
              className="wq-bar-fill"
              style={{ width: `${shallowWorkPct}%`, background: "#6b6b80" }}
            />
          </div>
          <div className="wq-time">{fmt(shallowWorkTime)}</div>
        </div>
      </div>

      {deepWorkPct === 0 && shallowWorkPct === 0 && (
        <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", textAlign: "center", padding: "12px 0 0" }}>
          No active sessions yet — start working to see your work quality breakdown
        </p>
      )}
    </div>
  );
}