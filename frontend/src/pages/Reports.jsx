import React, { useState, useEffect, useCallback } from 'react';
import ReportsHeader from '../components/Reports/ReportsHeader';
import SummaryCards from '../components/Reports/SummaryCards';
import SearchBar from '../components/Reports/SearchBar';
import ExportButtons from '../components/Reports/ExportButtons';
import ReportsTable from '../components/Reports/ReportsTable';
import { useTheme } from '../context/ThemeContext';
// import './Reports.css';

function Reports() {
  const { darkMode, accentColor } = useTheme();
  const [period, setPeriod] = useState("weekly");
  const [summary, setSummary] = useState({
    bestFocusDay: { day: "—", value: "0h 0m" },
    avgFocusHours: "0h 0m",
    totalFocusTime: "0h 0m",
    consistency: 0,
    trackedDays: 0,
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    console.log("🔄 Starting reports data load...");
    
    if (!window.api) {
      console.warn("⚠️ window.api not available - running outside Electron?");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summaryData, tableRows] = await Promise.all([
        window.api.getReportSummary(period),
        window.api.getReportTable(period)
      ]);

      setSummary(summaryData);
      setTableData(tableRows);
      console.log("📋 Reports data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = async () => {
    if (!window.api) return;
    try {
      const csv = await window.api.getReportCSV(period);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeboard-report-${period}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Reports] CSV export failed:", error);
    }
  };

  return (
    <div 
      className="p-7 space-y-6"
      style={{
        '--accent-color': accentColor,
        '--accent-hover': `${accentColor}dd`,
        '--accent-muted': `${accentColor}20`,
      }}
    >
      <ReportsHeader period={period} trackedDays={summary.trackedDays} />

      {/* Summary Cards */}
      <div className="">
        <div className="flex space-x-10 justify-between h-40 w-300">
          <SummaryCards
            title="Best Focus Day:"
            value={summary.bestFocusDay.value}
            subtitle={summary.bestFocusDay.day}
            className="w-full"
          />
          <SummaryCards
            title="Average Focus Hours:"
            value={summary.avgFocusHours}
            className="w-full"
          />
          <SummaryCards
            title="Total Focus Time:"
            value={summary.totalFocusTime}
            className="w-full"
          />
          <SummaryCards
            title="Consistency:"
            value={`${summary.consistency}%`}
            className="w-full"
          />
        </div>

        <div className="pt-6">
          <div className="flex items-end justify-between">
            <SearchBar selected={period} onPeriodChange={setPeriod} />
            <ExportButtons onExportCSV={handleExportCSV} />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <ReportsTable data={tableData} loading={loading} />
    </div>
  );
}

export default Reports;
