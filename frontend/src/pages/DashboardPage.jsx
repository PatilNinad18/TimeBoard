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

function localDateStr() {
  const now = new Date();
  return now.getFullYear() + "-" +
    String(now.getMonth()+1).padStart(2,"0") + "-" +
    String(now.getDate()).padStart(2,"0");
}

const Dashboard = () => {
  const { accentColor }     = useTheme();
  const { distractingApps } = useUser();

  const [result,      setResult]      = useState(null);
  const [apps,        setApps]        = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!window.api) { setLoading(false); return; }

    async function loadData() {
      try {
        const today       = localDateStr();
        const rawSessions = await window.api.getActivitySessions(today);

        if (!rawSessions || rawSessions.length === 0) {
          setResult({ productiveTime: 0, distractingTime: 0, deepWorkTime: 0, focusScore: 0 });
          setApps([]);
          setLastUpdated(new Date().toLocaleTimeString());
          setLoading(false);
          return;
        }

        const distApps = distractingApps || [];
        console.log("[Dashboard] distractingApps:", distApps);

        // Convert to sessionProcessor format
        // durationMinutes comes from backend and is already in minutes
        const sessions = rawSessions
          .filter(s => s?.appName && typeof s.durationMinutes === "number" && s.durationMinutes > 0)
          .map(s => ({
            app:       s.appName,
            startTime: new Date(s.realTimestamp).getTime(),
            endTime:   new Date(s.realTimestamp).getTime() + s.durationMinutes * 60000,
            duration:  s.durationMinutes, // ← minutes, confirmed
          }));

        console.log("[Dashboard] sessions sample:", sessions.slice(0,3));
        console.log("[Dashboard] total sessions:", sessions.length);

        const processed = processSessions(sessions, distApps);
        console.log("[Dashboard] processed:", processed);

        setResult(processed);

        // Per-app totals for chart
        const appMap = {};
        for (const s of sessions) {
          appMap[s.app] = (appMap[s.app] || 0) + s.duration;
        }

        const chartApps = Object.entries(appMap)
          .sort((a, b) => b[1] - a[1])
          .map(([app, minutes]) => ({
            app,
            name:     app,
            minutes:  Math.round(minutes),
            category: distApps.includes(app) ? "Distracting" : "Productive",
          }));

        setApps(chartApps);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("[Dashboard] load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const id = setInterval(loadData, 120000);
    return () => clearInterval(id);
  }, [distractingApps]);

  const productive  = result ? fmtMinutes(result.productiveTime)  : "0m";
  const distracting = result ? fmtMinutes(result.distractingTime) : "0m";
  const deepWork    = result ? fmtMinutes(result.deepWorkTime)     : "0m";
  const focusScore  = result?.focusScore ?? 0;

  return (
    <div className="dash-page" style={{ "--accent-color": accentColor }}>
      <div className="dash-topbar">
        <Header />
      </div>

      <div className="dash-body">

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "var(--text-secondary)" }}>
            Loading…
          </div>
        ) : (
          <>
            <div className="dash-cards dash-cards-4">
              <SummaryCard title="Total Productive Time"  value={productive}       icon={<FaClock />}     />
              <SummaryCard title="Total Distracting Time" value={distracting}      icon={<FaChartLine />} />
              <SummaryCard title="Deep Work Time"          value={deepWork}         icon={<FaBrain />}     />
              <SummaryCard title="Focus Score"             value={`${focusScore}%`} icon={<FaBolt />}      />
            </div>

            <div className="dash-main">
              <div className="dash-chart">
                <ProductivityChart data={apps} lastUpdated={lastUpdated} />
              </div>
              <div className="dash-side">
                <FocusCard score={focusScore} />
                <AppUsage  apps={apps} />
              </div>
            </div>

            <ProductiveVsDistracting
              apps={apps}
              distractingApps={distractingApps || []}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;