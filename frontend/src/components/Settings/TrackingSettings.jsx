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

    </>
  );
}
