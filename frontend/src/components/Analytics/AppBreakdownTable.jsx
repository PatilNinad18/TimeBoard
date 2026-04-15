import { useState } from "react";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_APPS = [];

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
          {visible.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", color: "#888", padding: "1.5rem 0" }}>
                No app usage tracked yet
              </td>
            </tr>
          )}
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
