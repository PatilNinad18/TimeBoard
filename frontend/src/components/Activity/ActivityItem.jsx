import React from "react";
import { Moon } from "lucide-react";

function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `${seconds || 0}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

const APP_COLORS = {
  "VS Code": "#007ACC",
  Chrome: "#4285F4",
  Spotify: "#1DB954",
  Twitter: "#111111",
  Notion: "#000000",
  Slack: "#4A154B",
  YouTube: "#FF0000",
  Figma: "#A259FF",
  Safari: "#006CFF",
  Finder: "#28C6E8",
};

const CategoryBadge = ({ cat }) => (
  <span className={`item-cat-badge cat-${cat?.toLowerCase()}`}>{cat}</span>
);

export default function ActivityItem({ item, isIdle = false, showIdleDetails = false }) {
  if (isIdle) {
    return (
      <div className="activity-item idle-item">
        <div className="idle-indicator">
          <Moon size={12} className="idle-icon" />
          <span className="idle-label">Idle</span>
          <span className="idle-duration">{item.duration}</span>
        </div>
      </div>
    );
  }

  const initials = item.appName?.slice(0, 2).toUpperCase() || "??";
  const color = APP_COLORS[item.appName] || "#555";

  return (
    <div className="activity-item session-item">
      {/* App icon */}
      <div className="item-icon" style={{ background: color }}>
        {initials}
      </div>

      {/* Main info */}
      <div className="item-info">
        <div className="item-name-row">
          <span className="item-app-name">{item.appName}</span>
          <CategoryBadge cat={item.category} />
        </div>
        {item.windowTitle && (
          <span className="item-window-title" title={item.windowTitle}>
            {item.windowTitle}
          </span>
        )}
        {showIdleDetails && item.idleSeconds > 0 && item.idleSeconds < item.durationSeconds && (
          <span className="item-idle-summary">
            {formatDuration(item.idleSeconds)} idle
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="item-right">
        <span className="item-duration">{item.duration}</span>
        <span className="item-timestamp">{item.exactTime}</span>
      </div>

      {/* Duration bar accent */}
      <div
        className="item-duration-bar"
        style={{
          width: `${Math.min((item.durationMinutes / 60) * 100, 100)}%`,
          background: color,
        }}
      />
    </div>
  );
}
