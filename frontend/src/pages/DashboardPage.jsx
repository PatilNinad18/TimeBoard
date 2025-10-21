import React from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import TaskList from "../components/Dashboard/TaskList";
import { FaClock, FaChartLine, FaBrain } from "react-icons/fa";

const Dashboard = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <DashboardHeader />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard title="Focus Hours" value="4h 20m" icon={<FaClock />} />
      <SummaryCard title="Productivity Score" value="82%" icon={<FaChartLine />} />
      <SummaryCard title="Focus Sessions" value="3 sessions" icon={<FaBrain />} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ProductivityChart />
      </div>
      <TaskList />
    </div>
  </div>
);

export default Dashboard;
