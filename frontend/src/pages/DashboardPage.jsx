import React from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import { FaClock, FaChartLine } from "react-icons/fa";
import FocusCard from "../components/Dashboard/FocusCard";
import AppUsage from "../components/Dashboard/AppUsage";
import ProductiveVsDistracting from "../components/Dashboard/ProductiveVsDistracting";
import DistractingAppsModal from "../components/Dashboard/DistractingAppsModal";
import LandingPage from "../components/LandingPage/LandingPage";

const Dashboard = (landingData) => (
  <div className="flex h-screen w-screen bg-gray-50">

    {/* Main content area minus sidebar width */}
    <div className="flex flex-col px-6 pt-3 pb-6 overflow-hidden" style={{ width: 'calc(100% - 288px)' }}>

      {/* Header */}
      <div className="flex-shrink-0 mb-2">
        <DashboardHeader />
      </div>

      {/* Main scrollable section */}
      <div className="flex-1 overflow-auto">

        {/* Top Row: Left + Right */}
        <div className="flex gap-4 h-full">

          {/* Left column: slightly narrower */}
          <div className="flex-[2] flex flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <SummaryCard
                title="Total Productive Time"
                value="4h 20m"
                icon={<FaClock />}
                className="w-full"
              />
              <SummaryCard
                title="Total Distracting Time"
                value="1h 26m"
                icon={<FaChartLine />}
                className="w-full"
              />
            </div>

            {/* Productivity Chart */}
            <div className="flex-1">
              <ProductivityChart />
            </div>
          </div>

          {/* Right column */}
          <div className="flex-[1] flex flex-col gap-4">
            <FocusCard />
            <div className="flex-1 overflow-auto">
              <AppUsage />
            </div>

          </div>

        </div>
          <ProductiveVsDistracting distractingApps={landingData.distractingApps} />

      </div>
    </div>
  </div>
);

export default Dashboard;
