import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import { FaClock, FaChartLine } from "react-icons/fa";
import FocusCard from "../components/Dashboard/FocusCard";
import AppUsage from "../components/Dashboard/AppUsage";
import ProductiveVsDistracting from "../components/Dashboard/ProductiveVsDistracting";
import Header from "../components/Header";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

const Dashboard = ({ landingData }) => {
  const [stats, setStats] = useState({
    productive: 0,
    distracting: 0,
    idle: 0,
    score: 0,
  });

  const [apps, setApps] = useState([]);

  useEffect(() => {
    console.log("🔍 Dashboard component mounted");
    console.log("🔍 window.api available:", !!window.api);
    
    if (!window.api) {
      console.warn("⚠️ window.api not available - running outside Electron?");
      return;
    }

    async function loadData() {
      try {
        console.log("🔄 Starting data load...");
        
        const statsData = await window.api.getTodayProductivityStats();
        console.log("📊 Stats data received:", statsData);
        
        const usageData = await window.api.getUsage();
        console.log("📊 Usage data received:", usageData);

        // Format stats to show minutes instead of seconds
        const formattedStats = {
          ...statsData,
          productive: formatTime(statsData.productive || 0),
          distracting: formatTime(statsData.distracting || 0),
          idle: formatTime(statsData.idle || 0),
        };

        setStats(formattedStats);
        setApps(usageData);
        console.log("✅ State updated with real data");

      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <div
        className="flex flex-col px-6 pt-3 pb-6 overflow-hidden"
        style={{ width: "calc(100% - 288px)" }}
      >
        <div className="flex-shrink-0 mb-2">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-4 h-full">
            <div className="flex-[2] flex flex-col gap-4 min-h-fit">
              <div className="grid grid-cols-2 gap-4 w-full">
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

              <div className="flex-1 min-h-[300px]">
                <ProductivityChart
                  data={apps.map((app) => ({
                    app: app.name,
                    minutes: Math.round(app.totalSeconds / 60),
                    category: app.category,
                  }))}
                />
              </div>
            </div>

            <div className="flex-[1] flex flex-col gap-4 min-h-fit">
              <FocusCard score={stats.score} />
              <div className="flex-1 overflow-auto">
                <AppUsage apps={apps} />
              </div>
            </div>
          </div>

          <ProductiveVsDistracting
            apps={apps}
            distractingApps={landingData?.distractingApps}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;