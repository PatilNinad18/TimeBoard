import React, { useEffect, useState } from "react";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import { FaClock, FaChartLine, FaBrain, FaBolt } from "react-icons/fa";
import FocusCard from "../components/Dashboard/FocusCard";
import AppUsage from "../components/Dashboard/AppUsage";
import ProductiveVsDistracting from "../components/Dashboard/ProductiveVsDistracting";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { processSessions, fmtMinutes } from "../utils/sessionProcessor";
import "./Dashboard.css";

const Dashboard = () => {
  const { accentColor }     = useTheme();
  const { distractingApps } = useUser();

  const [result,      setResult]      = useState(null);
  const [apps,        setApps]        = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!window.api) return;

    async function loadData() {
      try {
        const usageData = await window.api.getUsage();
        if (!usageData) return;

        // Build session list — duration is in MINUTES
        // getUsage returns totalSeconds per app, so convert to minutes
        const sessions = usageData.map((u, i) => ({
          app:       u.app,
          startTime: i * 1000,              // fake ordering for sort
          endTime:   i * 1000 + u.totalSeconds * 1000,
          duration:  u.totalSeconds / 60,   // ← MINUTES, not seconds
        }));

        const processed = processSessions(sessions, distractingApps || []);
        setResult(processed);

        // Apps for chart — use raw usage data (not merged, for accurate per-app display)
        const chartApps = usageData
          .sort((a, b) => b.totalSeconds - a.totalSeconds)
          .map(u => ({
            app:      u.app,
            name:     u.app,
            minutes:  Math.round(u.totalSeconds / 60),
            category: (distractingApps || []).includes(u.app) ? "Distracting" : "Productive",
          }));

        setApps(chartApps);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("[Dashboard] load error:", err);
      }
    }

    loadData();
    const id = setInterval(loadData, 120000);
    return () => clearInterval(id);
  }, [distractingApps]);

  // result times are already in MINUTES — fmtMinutes handles them directly
  const productive  = result ? fmtMinutes(result.productiveTime)  : "0h 0m";
  const distracting = result ? fmtMinutes(result.distractingTime) : "0h 0m";
  const deepWork    = result ? fmtMinutes(result.deepWorkTime)     : "0h 0m";
  const focusScore  = result?.focusScore ?? 0;

  return (
    <div className="dash-page" style={{ "--accent-color": accentColor }}>
      <div className="dash-topbar">
        <Header />
      </div>

      <div className="dash-body">
        {/* Row 1 — 4 summary cards */}
        <div className="dash-cards dash-cards-4">
          <SummaryCard title="Total Productive Time"  value={productive}       icon={<FaClock />}    />
          <SummaryCard title="Total Distracting Time" value={distracting}      icon={<FaChartLine />} />
          <SummaryCard title="Deep Work Time"          value={deepWork}         icon={<FaBrain />}    />
          <SummaryCard title="Focus Score"             value={`${focusScore}%`} icon={<FaBolt />}     />
        </div>

        {/* Row 2 — chart + side column */}
        <div className="dash-main">
          <div className="dash-chart">
            <ProductivityChart data={apps} lastUpdated={lastUpdated} />
          </div>
          <div className="dash-side">
            <FocusCard score={focusScore} />
            <AppUsage  apps={apps} />
          </div>
        </div>

        {/* Row 3 — apps overview */}
        <ProductiveVsDistracting
          apps={apps}
          distractingApps={distractingApps || []}
        />
      </div>
    </div>
  );
};

export default Dashboard;