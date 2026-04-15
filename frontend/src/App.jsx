import React from "react";
import Dashboard from "./pages/DashboardPage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Activity from "./pages/Activity";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/activity"  element={<Activity />}  />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports"   element={<Reports />}   />
            <Route path="/settings"  element={<Settings />}  />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}