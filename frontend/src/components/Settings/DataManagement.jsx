import { Trash2, Zap } from "lucide-react";
import React from "react";
export default function DataManagement({
  version = "12.0",
  enabled = false,
  onToggle,
  onDeleteToday,
  onClearAll,
}) {
  return (
    <div className="settings-card data-mgmt">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Data Management</h3>
          <p className="card-subtitle">Version: {version}</p>
        </div>
        <label className="small-toggle">
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle?.(e.target.checked)} />
          <span className="small-toggle-track" />
        </label>
      </div>

      <div className="data-actions">
        <button className="data-btn" onClick={onDeleteToday}>
          <Trash2 size={14} />
          Delete Today's Data
        </button>
        <button className="data-btn danger" onClick={onClearAll}>
          <Zap size={14} />
          <span>
            Clear All Data
            <small>(Database will be reset)</small>
          </span>
        </button>
      </div>
    </div>
  );
}
