import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import React from "react";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-full">
        <Sidebar/>
        <div className="flex-1 p-6 bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
