import React from "react";

const DEFAULT_DISTRACTIONS = [
  { id: 1, name: "Twitter", icon: "𝕏", iconBg: "#111", time: "3h 12m", minutes: 192, maxMinutes: 192 },
  { id: 2, name: "YouTube", icon: "▶", iconBg: "#FF0000", time: "2h 45m", minutes: 165, maxMinutes: 192 },
  { id: 3, name: "Slack", icon: "S", iconBg: "#4A154B", time: "2h 20m", minutes: 140, maxMinutes: 192 },
  { id: 4, name: "Reddit", icon: "R", iconBg: "#FF4500", time: "1h 05m", minutes: 65, maxMinutes: 192 },
];

const BAR_COLORS = ["#F5C518", "#E8A000", "#D4880A", "#C06E14"];

export default function TopDistractions({ apps = DEFAULT_DISTRACTIONS }) {
  return (
    <div className="analytics-card top-distractions">
      <div className="card-header">
        <h3 className="section-num">4.</h3>
        <h3 className="section-title">Top Distractions</h3>
      </div>
      <p className="section-sub">Top Distracting Apps</p>

      <div className="distraction-list">
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
