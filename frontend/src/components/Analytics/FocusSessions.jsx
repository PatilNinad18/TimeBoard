import React from "react";
import { Zap, Repeat } from "lucide-react";

export default function FocusSessions({
  longestStreak = 145,
  sessionCount = 24,
  sessionThreshold = 25,
}) {
  return (
    <div className="analytics-card focus-sessions">
      <div className="card-header">
        <h3 className="section-num">6.</h3>
        <h3 className="section-title">Focus Sessions</h3>
      </div>

      <div className="session-stat">
        <div className="session-stat-label">
          <Zap size={13} className="stat-icon" />
          Longest focus streak
        </div>
        <div className="session-stat-value">{longestStreak} <span className="unit">min</span></div>
      </div>

      <div className="session-divider" />

      <div className="session-stat">
        <div className="session-stat-label">
          <Repeat size={13} className="stat-icon" />
          Number of sessions<br />
          <span className="threshold-note">(&gt;{sessionThreshold} min)</span>
        </div>
        <div className="session-stat-value big">{sessionCount}</div>
      </div>
    </div>
  );
}
