import React, { useState } from "react";
import DateFilter from "../components/Analytics/DateFilter";
import SummaryCards from "../components/Analytics/SummaryCards";
import TimeDistribution from "../components/Analytics/TimeDistribution";
import AppBreakdownTable from "../components/Analytics/AppBreakdownTable";
import TopDistractions from "../components/Analytics/TopDistractions";
import FocusTrendChart from "../components/Analytics/FocusTrendChart";
import FocusSessions from "../components/Analytics/FocusSessions";
import "./Analytics.css";

// ── Mock data (swap with real API calls) ────────────────────────────
const MOCK_STATS = {
  productiveTime: { label: "Total Productive Time", value: "35h 15m", trend: "up", delta: "+12%" },
  distractingTime: { label: "Total Distracting Time", value: "12h 05m", trend: "down", delta: "-8%" },
  idleTime: { label: "Total Idle Time", value: "4h 30m", trend: "neutral", delta: "0%" },
  focusScore: { label: "Focus Score %", value: "75%", trend: "up", scoreRaw: 75 },
};

export default function Analytics() {
  const [filter, setFilter] = useState("Last 7 days");

  return (
    <div className="analytics-page">
      {/* ── Header ─────────────────────────────── */}
      <div className="analytics-header">
        <div className="header-title-block">
          <h1 className="analytics-title">Analytics</h1>
          <span className="analytics-subtitle">Timeboard • {filter}</span>
        </div>
      </div>

      {/* ── Date Filter ────────────────────────── */}
      <DateFilter selected={filter} onFilterChange={setFilter} />

      {/* ── Summary Cards ──────────────────────── */}
      <SummaryCards stats={MOCK_STATS} />

      {/* ── Row 2: Distribution + Breakdown ────── */}
      <div className="analytics-row two-col">
        <TimeDistribution />
        <AppBreakdownTable />
      </div>

      {/* ── Row 3: Distractions + Trend + Sessions */}
      <div className="analytics-row three-col">
        <TopDistractions />
        <FocusTrendChart />
        <FocusSessions longestStreak={145} sessionCount={24} />
      </div>
    </div>
  );
}
