import React from "react";
import { Search, X } from "lucide-react";

export default function ActivitySearch({ value = "", onChange }) {
  return (
    <div className="activity-search">
      <Search size={14} className="as-icon" />
      <input
        type="text"
        placeholder="Search by app name…"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="as-input"
      />
      {value && (
        <button className="as-clear" onClick={() => onChange?.("")}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}
