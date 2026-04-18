import React from "react";

const SummaryCard = ({ title, value, icon }) => (
  <div
    className="rounded-2xl shadow-md p-4 flex items-center gap-4 transition"
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
    }}
  >
    <div
      className="text-2xl"
      style={{ color: "var(--accent-color)" }}
    >
      {icon}
    </div>

    <div className="min-w-0">
      <p
        className="text-sm truncate"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </p>

      <h3
        className="text-2xl font-bold font-mono tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </h3>
    </div>
  </div>
);

export default SummaryCard;