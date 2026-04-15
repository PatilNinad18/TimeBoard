import { Play, Square, Pause, RotateCcw } from "lucide-react";
import React from "react";

const THRESHOLDS = ["30 sec", "1 min", "5 min"];

export default function TrackingSettings({
  idleThreshold = "30 sec",
  onIdleChange,
  onStartTracking,
  onStopTracking,
  onPauseTracking,
  onResetData,
}) {
  return (
    <>
      {/* Idle Threshold Card */}
      <div className="settings-card tracking-idle">
        <h3 className="card-title">Tracking — Idle Threshold</h3>
        <div className="threshold-options">
          {THRESHOLDS.map((t) => (
            <label key={t} className="radio-option">
              <input
                type="radio"
                name="idleThreshold"
                value={t}
                defaultChecked={idleThreshold === t}
                onChange={() => onIdleChange?.(t)}
              />
              <span className="radio-dot" />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Controls Card */}
      <div className="settings-card tracking-controls">
        <h3 className="card-title">Tracking — Controls</h3>
        <div className="control-buttons">
          <button className="ctrl-btn primary" onClick={onStartTracking}>
            <Play size={14} fill="currentColor" /> Start Tracking
          </button>
          <button className="ctrl-btn primary" onClick={onStopTracking}>
            <Square size={14} fill="currentColor" /> Stop Tracking
          </button>
          <button className="ctrl-btn primary" onClick={onPauseTracking}>
            <Pause size={14} fill="currentColor" /> Pause Tracking
          </button>
          <button className="ctrl-btn outline" onClick={onResetData}>
            <RotateCcw size={14} /> Reset Today's Data
          </button>
        </div>
      </div>
    </>
  );
}
