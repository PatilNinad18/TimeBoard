import React from "react";
import DashboardHeader from "./DashboardHeader";
import SummaryCard from "./SummaryCard";
import ProductivityChart from "./ProductivityChart";
import TaskList from "./TaskList";
import { FaClock, FaChartLine, FaBrain } from "react-icons/fa";

const Dashboard = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <DashboardHeader />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard title="Total Productive Time" value="4h 20m" icon={<FaClock />} />
      <SummaryCard title="Total Distracting Time" value="82%" icon={<FaChartLine />} />
      <SummaryCard title="Focus Score" value="3 sessions" icon={<FaBrain />} />
    </div>

    <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ProductivityChart />
      </div>
      <TaskList />
    </div>
  </div>
);

export default Dashboard;
