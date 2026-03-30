import { useState } from "react";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_APPS = [
  { id: 1, name: "Notion", icon: "N", iconBg: "#000", time: "35h 15m", category: "Productive" },
  { id: 2, name: "Slack", icon: "S", iconBg: "#4A154B", time: "2h 45m", category: "Neutral" },
  { id: 3, name: "VS Code", icon: "⌨", iconBg: "#007ACC", time: "4h 30m", category: "Distracting" },
  { id: 4, name: "Chrome", icon: "C", iconBg: "#4285F4", time: "3h 12m", category: "Distracting" },
  { id: 5, name: "Twitter", icon: "𝕏", iconBg: "#111", time: "2h 45m", category: "Distracting" },
  { id: 6, name: "YouTube", icon: "▶", iconBg: "#FF0000", time: "1h 30m", category: "Distracting" },
  { id: 7, name: "Figma", icon: "F", iconBg: "#A259FF", time: "5h 10m", category: "Productive" },
];

const PAGE_SIZE = 5;

const CategoryBadge = ({ cat }) => (
  <span className={`cat-badge cat-${cat.toLowerCase()}`}>{cat}</span>
);

export default function AppBreakdownTable({ apps = DEFAULT_APPS }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(apps.length / PAGE_SIZE);
  const visible = apps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="analytics-card app-breakdown">
      <div className="card-header">
        <div className="header-left">
          <h3 className="section-num">3.</h3>
          <h3 className="section-title">App Usage Breakdown</h3>
        </div>
        <span className="card-filename">AppBreakdownTable.jsx</span>
      </div>

      <table className="breakdown-table">
        <thead>
          <tr>
            <th>App Name</th>
            <th>Time Spent</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((app) => (
            <tr key={app.id} className="app-row-tr">
              <td>
                <div className="app-cell">
                  <div className="app-icon-circle" style={{ background: app.iconBg }}>
                    {app.icon}
                  </div>
                  <span>{app.name}</span>
                </div>
              </td>
              <td className="time-cell">{app.time}</td>
              <td><CategoryBadge cat={app.category} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-footer">
        <span className="page-label">Page {page}</span>
        <div className="page-controls">
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
