import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import FocusCard from "../components/Dashboard/FocusCard";
import AppUsage from "../components/Dashboard/AppUsage";
import ProductiveVsDistracting from "../components/Dashboard/ProductiveVsDistracting";
import { FaClock, FaChartLine } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import "./Dashboard.css";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

const Dashboard = ({ landingData }) => {
  const { darkMode, accentColor } = useTheme();
  const { distractingApps, refreshTrigger } = useUser();
  const [stats, setStats] = useState({
    productive: "0h 0m",
    distracting: "0h 0m",
    idle: "0h 0m",
    score: 0,
  });
  const [apps, setApps] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!window.api) return;

    async function loadData() {
      try {
        console.log('[Dashboard] Starting data load...', { refreshTrigger });
        
        // Force fresh API calls by adding timestamp
        const [statsData, usageData] = await Promise.all([
          window.api.getTodayProductivityStats(),
          window.api.getUsage(),
        ]);

        console.log('[Dashboard] Stats data received:', statsData);
        console.log('[Dashboard] Usage data received:', usageData);
        console.log('[Dashboard] Focus score from backend:', statsData.score);

        setStats({
          productive:  formatTime(statsData.productive  || 0),
          distracting: formatTime(statsData.distracting || 0),
          idle:        formatTime(statsData.idle        || 0),
          score:       statsData.score || 0,
        });

        const processedApps = (usageData || []).map((app) => ({
          app:          app.app,
          name:         app.app,
          minutes:      app.minutes || Math.round((app.totalSeconds || 0) / 60),
          totalSeconds: app.totalSeconds || 0,
          category:     app.category,
        }));
        
        console.log('[Dashboard] Processed apps:', processedApps);
        setApps(processedApps);

        setLastUpdated(new Date().toLocaleTimeString());
        console.log('[Dashboard] Data load completed');
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }

    loadData();
    const id = setInterval(loadData, 120000);
    return () => clearInterval(id);
  }, [refreshTrigger]);

  return (
    <div 
      className="dash-page"
      style={{
        '--accent-color': accentColor,
        '--accent-hover': `${accentColor}dd`,
        '--accent-muted': `${accentColor}20`,
      }}
    >
      {/* Top bar */}
      <div className="dash-topbar">
        <Header />
      </div>

      {/* Scrollable body */}
      <div className="dash-body">

        {/* Row 1 — summary cards */}
        <div className="dash-cards">
          <SummaryCard
            title="Total Productive Time"
            value={stats.productive}
            icon={<FaClock />}
          />
          <SummaryCard
            title="Total Distracting Time"
            value={stats.distracting}
            icon={<FaChartLine />}
          />
        </div>

        {/* Row 2 — chart + right column */}
        <div className="dash-main">
          <div className="dash-chart">
            <ProductivityChart data={apps} lastUpdated={lastUpdated} />
          </div>

          <div className="dash-side">
            <FocusCard score={stats.score} />
            <AppUsage apps={apps} />
          </div>
        </div>

        {/* Row 3 — apps overview */}
        <ProductiveVsDistracting
          apps={apps}
          distractingApps={distractingApps}
        />

      </div>
    </div>
  );
};

export default Dashboard;