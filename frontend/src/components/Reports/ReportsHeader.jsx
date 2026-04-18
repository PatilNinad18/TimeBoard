import React from "react";

function ReportsHeader({ period = "weekly", trackedDays = 0 }) {
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

  return (
    <header 
      className="flex justify-between items-center backdrop-blur-lg shadow-md p-5 rounded-2xl mb-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Left Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-8 bg-gradient-to-b rounded-full" 
            style={{ background: "var(--accent-color)" }}
          />
          <h3 
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Productivity Overview
          </h3>
        </div>
        <p 
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {periodLabel} report &bull; {trackedDays} day{trackedDays !== 1 ? "s" : ""} tracked
        </p>
      </div>
    </header>
  );
}

export default ReportsHeader;
