import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ScoreBadge = ({ score }) => {
  let color = "#6B7280";
  let bg = "#F3F4F6";
  if (score >= 70) { color = "#16A34A"; bg = "#DCFCE7"; }
  else if (score >= 40) { color = "#CA8A04"; bg = "#FEF9C3"; }
  else if (score > 0) { color = "#DC2626"; bg = "#FEE2E2"; }

  return (
    <span
      style={{
        background: bg,
        color: color,
        padding: "4px 10px",
        borderRadius: "12px",
        fontWeight: 600,
        fontSize: "13px",
      }}
    >
      {score}%
    </span>
  );
};

function ReportsTable({ data = [], loading = false }) {
  if (loading) {
    return (
      <div 
        className="rounded-2xl shadow-md p-8 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          Loading report data...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="rounded-2xl shadow-md p-8 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p 
          className="text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          No data available yet
        </p>
        <p 
          className="text-sm mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Start using apps and TimeBoard will track your productivity
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl shadow-md overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <table className="w-full text-left">
        <thead>
          <tr 
            className="border-b"
            style={{
              background: "var(--surface-variant)",
              borderColor: "var(--border)",
            }}
          >
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Date
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Day
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Total Time
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Productive
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Distracting
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Idle
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Focus Score
            </th>
            <th 
              className="px-5 py-4 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Top App
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={row.id} 
              className="border-b transition-colors"
              style={{
                borderColor: "var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-variant)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <td 
                className="px-5 py-4 text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {row.date}
              </td>
              <td 
                className="px-5 py-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.dayName}
              </td>
              <td 
                className="px-5 py-4 text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {row.totalTime}
              </td>
              <td 
                className="px-5 py-4 text-sm font-medium"
                style={{ color: "var(--productive)" }}
              >
                {row.productiveTime}
              </td>
              <td 
                className="px-5 py-4 text-sm font-medium"
                style={{ color: "var(--distracting)" }}
              >
                {row.distractingTime}
              </td>
              <td 
                className="px-5 py-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.idleTime}
              </td>
              <td className="px-5 py-4">
                <ScoreBadge score={row.focusScore} />
              </td>
              <td 
                className="px-5 py-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.topApp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportsTable;
