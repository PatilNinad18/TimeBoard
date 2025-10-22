import React from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SummaryCard from "../components/Dashboard/SummaryCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import TaskList from "../components/Dashboard/TaskList";
import { FaClock, FaChartLine, FaBrain } from "react-icons/fa";
import FocusCard from "../components/Dashboard/FocusCard";

const Dashboard = () => (
  <div className="bg-gray-50 h-full w-full">
    <DashboardHeader />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard title="Total Productive Time" value="4h 20m" icon={<FaClock />} />
      <SummaryCard title="Total Distracting Time" value="1h 26m" icon={<FaChartLine />} />
      {/* <SummaryCard title="Focus Score" value="3 sessions" icon={<FaBrain />} /> */}
      <FocusCard/>
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
