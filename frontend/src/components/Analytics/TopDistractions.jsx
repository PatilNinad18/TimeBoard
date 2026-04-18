import React from "react";

const DEFAULT_DISTRACTIONS = [];

const BAR_COLORS = ["#F5C518", "#E8A000", "#D4880A", "#C06E14"];

export default function TopDistractions({ apps = DEFAULT_DISTRACTIONS }) {
  return (
    <div className="analytics-card top-distractions">
      <div className="card-header">
        <h3 className="section-title">Top Distractions</h3>
      </div>
      <p className="section-sub">Top Distracting Apps</p>

      <div className="distraction-list">
        {apps.length === 0 && (
          <p style={{ color: "var(--text-secondary, #888)", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
            No distracting apps tracked yet
          </p>
        )}
        {apps.map((app, i) => (
          <div key={app.id} className="distraction-row">
            <div className="dist-app-info">
              <div className="app-icon-circle small" style={{ background: app.iconBg }}>
                {app.icon}
              </div>
              <span className="dist-name">{app.name}</span>
              <span className="dist-time">{app.time}</span>
            </div>
            <div className="dist-bar-track">
              <div
                className="dist-bar-fill"
                style={{
                  width: `${(app.minutes / app.maxMinutes) * 100}%`,
                  background: BAR_COLORS[i] || BAR_COLORS[3],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
