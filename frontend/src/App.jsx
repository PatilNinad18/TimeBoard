import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import React from "react";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-full">
        <Sidebar/>
        <div className="flex-1 p-3 bg-gray-100 w-full h-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
