
import React, { useState } from "react";
import { Calendar, Clock, Layers } from "lucide-react";

const DATE_PRESETS = ["Today", "Yesterday", "Custom"];

export default function ActivityHeader({
  totalSessions = 0,
  totalActiveTime = "0h 0m",
  onDateChange,
}) {
  const [active, setActive] = useState("Today");
  const [customDate, setCustomDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const select = (p) => {
    if (p === "Custom") { setShowCustom(true); return; }
    setActive(p);
    setShowCustom(false);
    onDateChange?.(p);
  };

  const applyCustom = () => {
    if (!customDate) return;
    setActive(customDate);
    setShowCustom(false);
    onDateChange?.(customDate);
  };

  return (
    <div className="activity-header">
      <div className="ah-top">
        <div className="ah-title-block">
          <h1 className="activity-title">Activity</h1>
          <span className="activity-subtitle">Timeboard • Session Log</span>
        </div>

        <div className="ah-stats">
          <div className="ah-stat">
            <Layers size={13} className="ah-stat-icon" />
            <span className="ah-stat-label">Sessions</span>
            <span className="ah-stat-value">{totalSessions}</span>
          </div>
          <div className="ah-stat-divider" />
          <div className="ah-stat">
            <Clock size={13} className="ah-stat-icon" />
            <span className="ah-stat-label">Active Time</span>
            <span className="ah-stat-value">{totalActiveTime}</span>
          </div>
        </div>
      </div>

      <div className="ah-controls">
        <div className="date-pills">
          {DATE_PRESETS.map((p) => (
            <button
              key={p}
              className={`date-pill ${active === p || (p === "Custom" && showCustom) ? "active" : ""}`}
              onClick={() => select(p)}
            >
              {p === "Custom" && <Calendar size={11} />}
              {p}
            </button>
          ))}
        </div>

        {showCustom && (
          <div className="custom-date-row">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="custom-date-input"
            />
            <button className="apply-btn" onClick={applyCustom}>Apply</button>
          </div>
        )}
      </div>
    </div>
  );
}
