import React, { useState, useEffect } from "react";
import { processSessions, fmtMinutes } from "../utils/sessionProcessor";
import { useUser } from "../context/UserContext";
import "./Reports.css";

const PERIOD_OPTIONS = ["daily", "weekly", "monthly"];
const PAGE_SIZE = 10;

function FocusScoreBadge({ score }) {
  const color = score >= 70
    ? "var(--productive)"
    : score >= 40
    ? "#facc15"
    : "var(--distracting)";
  return (
    <span className="focus-badge" style={{ color, borderColor: color }}>
      {score}%
    </span>
  );
}

export default function Reports() {
  const { distractingApps } = useUser();
  const [period,     setPeriod]     = useState("weekly");
  const [summary,    setSummary]    = useState(null);
  const [tableData,  setTableData]  = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [loading,    setLoading]    = useState(true);
  const [tableLoad,  setTableLoad]  = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    if (!window.api) { setLoading(false); return; }
    loadSummary();
  }, [period]);

  useEffect(() => {
    if (!window.api) return;
    loadTable(1);
  }, [period, distractingApps]);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const data = await window.api.getReportSummary(period);
      setSummary(data);
    } catch {
      setError("Failed to load report summary.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTable(page) {
    setTableLoad(true);
    try {
      const result = await window.api.getReportTable(period, page, PAGE_SIZE);
      if (result?.data) {
        // Enrich each row with deepWorkTime from sessionProcessor
        const enriched = result.data.map(row => {
          // Approximate session list from the row's totals
          // We don't have per-app breakdown per day here, so we approximate
          // Deep work = productive sessions that would be ≥ 25 min
          // Use the focus score from backend and add deepWork estimate
          const prodSecs = parseMinStr(row.productiveTime) * 60;
          const distSecs = parseMinStr(row.distractingTime) * 60;
          const sessions = [];
          if (prodSecs > 0) sessions.push({ app: "__productive__", startTime: 0, endTime: prodSecs, duration: prodSecs / 60 });
          if (distSecs > 0) sessions.push({ app: "__distracting__", startTime: prodSecs, endTime: prodSecs + distSecs, duration: distSecs / 60 });

          const processed = processSessions(sessions, ["__distracting__"]);
          return {
            ...row,
            deepWorkTime: fmtMinutes(processed.deepWorkTime),
            focusScore:   processed.focusScore > 0 ? processed.focusScore : row.focusScore,
          };
        });

        setTableData(enriched);
        setPagination({ ...result.pagination, page });
      }
    } catch {
      setTableData([]);
    } finally {
      setTableLoad(false);
    }
  }

  // Parse "1h 23m" or "45m" → minutes
  function parseMinStr(str = "") {
    const hMatch = str.match(/(\d+)h/);
    const mMatch = str.match(/(\d+)m/);
    return (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
  }

  async function handleExport() {
    try {
      const csv  = await window.api.getReportCSV(period);
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `timeboard-${period}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    }
  }

  const filteredRows = tableData.filter(row =>
    !search ||
    row.date.includes(search) ||
    row.dayName.toLowerCase().includes(search.toLowerCase()) ||
    row.topApp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="reports-title-block">
          <div className="reports-title-bar" />
          <div>
            <h1 className="reports-title">Productivity Overview</h1>
            <p className="reports-subtitle">
              {period.charAt(0).toUpperCase() + period.slice(1)} report
              {summary ? ` • ${summary.trackedDays} days tracked` : ""}
            </p>
          </div>
        </div>
        <button className="reports-export-btn" onClick={handleExport}>
          <span>⬇</span> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="reports-loading">
          <div className="reports-spinner" />
          <p>Loading report…</p>
        </div>
      ) : error ? (
        <div className="reports-error">
          <span>⚠</span> {error}
          <button onClick={loadSummary}>Retry</button>
        </div>
      ) : (
        <div className="reports-summary-grid">
          {[
            { label: "Best Focus Day",      value: summary?.bestFocusDay?.value || "0m", sub: summary?.bestFocusDay?.day },
            { label: "Average Focus Hours", value: summary?.avgFocusHours       || "0m" },
            { label: "Total Focus Time",    value: summary?.totalFocusTime      || "0m" },
            { label: "Consistency",         value: `${summary?.consistency || 0}%` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="reports-summary-card">
              <p className="summary-card-label">{label}:</p>
              <p className="summary-card-value">{value}</p>
              {sub && <p className="summary-card-sub">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="reports-toolbar">
        <div className="reports-tabs">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p}
              className={`reports-tab ${period === p ? "active" : ""}`}
              onClick={() => { setPeriod(p); }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="reports-search-wrap">
          <span className="reports-search-icon">🔍</span>
          <input
            className="reports-search"
            placeholder="Search by date, day or app…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="reports-table-wrap">
        {tableLoad ? (
          <div className="reports-table-loading">
            <div className="reports-spinner small" />
          </div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Total Time</th>
                <th>Productive</th>
                <th>Distracting</th>
                <th>Deep Work</th>
                <th>Idle</th>
                <th>Focus Score</th>
                <th>Top App</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="reports-empty-row">
                    {search ? "No results match your search." : "No data for this period."}
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id}>
                    <td className="td-date">{row.date}</td>
                    <td className="td-day">{row.dayName}</td>
                    <td className="td-mono">{row.totalTime}</td>
                    <td className="td-productive">{row.productiveTime}</td>
                    <td className="td-distracting">{row.distractingTime}</td>
                    <td className="td-mono" style={{ color: "var(--accent)" }}>{row.deepWorkTime}</td>
                    <td className="td-mono">{row.idleTime}</td>
                    <td><FocusScoreBadge score={row.focusScore} /></td>
                    <td className="td-app">{row.topApp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!tableLoad && pagination.total > PAGE_SIZE && (
        <div className="reports-pagination">
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
            <span className="pagination-total"> ({pagination.total} days)</span>
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={!pagination.hasPrev}
              onClick={() => loadTable(pagination.page - 1)}
            >
              ‹ Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - pagination.page) <= 2)
              .map(p => (
                <button
                  key={p}
                  className={`page-btn ${p === pagination.page ? "active" : ""}`}
                  onClick={() => loadTable(p)}
                >
                  {p}
                </button>
              ))
            }
            <button
              className="page-btn"
              disabled={!pagination.hasNext}
              onClick={() => loadTable(pagination.page + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}