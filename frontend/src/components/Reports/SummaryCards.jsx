import React from "react";

const SummaryCards = ({ title, value, subtitle }) => (
  <div 
    className="rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition w-full"
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
    }}
  >
    <div>
      <p 
        className="text-2xl font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </p>
      <h3 
        className="text-3xl font-semibold" 
        style={{ color: "var(--accent-color)" }}
      >
        {value}
      </h3>
      {subtitle && (
        <p 
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

export default SummaryCards;
