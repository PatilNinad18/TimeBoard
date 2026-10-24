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
  "Google Chrome": "#4285F4",
  WhatsApp: "#25D366",
  LeetCode: "#FFA116",
  GitHub: "#24292E",
  ChatGPT: "#10A37F",
  YouTube: "#FF0000",
  Spotify: "#1DB954",
  Twitter: "#111111",
  "X (Twitter)": "#111111",
  LinkedIn: "#0A66C2",
  Reddit: "#FF4500",
  "Stack Overflow": "#F48024",
  "Google Docs": "#4285F4",
  "Google Sheets": "#0F9D58",
  Gmail: "#EA4335",
  "Google Meet": "#00897B",
  Notion: "#000000",
  Figma: "#A259FF",
  Slack: "#4A154B",
  Discord: "#5865F2",
  Twitch: "#9146FF",
  Amazon: "#FF9900",
  Netflix: "#E50914",
  Coursera: "#0056D2",
  GeeksforGeeks: "#2F8D46",
  Codeforces: "#1F8ACB",
  Supabase: "#3ECF8E",
  Safari: "#006CFF",
  Finder: "#28C6E8",
};

const FALLBACK_PALETTE = [
  "#007ACC", "#4285F4", "#FF0000", "#006CFF", "#EA4335",
  "#2AABEE", "#0084FF", "#F5C518", "#E07B39", "#9B59B6",
  "#25D366", "#FFA116", "#10A37F", "#FF4500", "#0A66C2",
];

function getAppColor(name) {
  if (!name) return "#555";
  if (APP_COLORS[name]) return APP_COLORS[name];
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}

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
  const color = getAppColor(item.appName);

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
