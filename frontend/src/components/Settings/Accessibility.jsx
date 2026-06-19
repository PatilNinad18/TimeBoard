import { Download } from "lucide-react";
import React from "react";

export default function Accessibility({
  version = "12.0",
  enabled = false,
  onToggle,
  onExport,
}) {
  return (
    <div className="settings-card accessibility-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Accessibility</h3>
          <p className="card-subtitle">Version: {version}</p>
        </div>
        {/* <label className="small-toggle">
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle?.(e.target.checked)} />
          <span className="small-toggle-track" />
        </label> */}
      </div>

      <button className="export-btn" onClick={onExport}>
        <Download size={14} />
        Export All Data (CSV)
      </button>
    </div>
  );
}
