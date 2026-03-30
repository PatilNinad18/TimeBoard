import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import { FaClock, FaChartLine } from "react-icons/fa";
import FocusCard from "../components/Dashboard/FocusCard";
import AppUsage from "../components/Dashboard/AppUsage";
import ProductiveVsDistracting from "../components/Dashboard/ProductiveVsDistracting";
import Header from "../components/Header";

function formatTime(seconds){
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;

}


const Dashboard = ({ landingData }) => {

  const [stats, setStats] = useState({
    productive: 0,
    distracting: 0,
    idle: 0,
    score: 0
  });

  const [apps, setApps] = useState([]);

  useEffect(() => {
    async function loadData() {
     const statsData = await window.api.getProductivityStats();
     const usageData = await window.api.getUsage();

      setStats(statsData);
      setStats(usageData);

    }

    loadData();

    const interval = setInterval(loadData, 5000);

    return ()=> clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50">

      <div className="flex flex-col px-6 pt-3 pb-6 overflow-hidden" style={{ width: 'calc(100% - 288px)' }}>

        <div className="flex-shrink-0 mb-2">
          <Header />
        </div>

        <div className="flex-1 overflow-auto">

          <div className="flex gap-4 h-full">

            <div className="flex-[2] flex flex-col gap-4">
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

                <SummaryCard
                  title="Idle Time"
                  value={formatTime(stats.idle)}
                  icon={<FaClock />}
                />
              </div>

              <div className="flex-1">
                <ProductivityChart data={apps.map(a=>({
                  app : a.app,
                  hours : (a.seconds / 3600).toFixed(2)
                }))} />

              </div>
            </div>

            <div className="flex-[1] flex flex-col gap-4">
              <FocusCard score={stats.score} />
              <div className="flex-1 overflow-auto">
                <AppUsage apps={apps} />
              </div>
            </div>

          </div>

          <ProductiveVsDistracting 
          apps={apps}
          distractingApps={landingData?.distractingApps} />

        </div>
      </div>
    </div>
  );
};

export default Dashboard;