import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";

export default function App() {
  const { onboarded, loading } = useUser();

  // Wait for localStorage to load before deciding
  if (loading) {
    return (
      <div className="app-boot-loader">
        <div className="boot-spinner" />
      </div>
    );
  }

  // First-time user -> show landing/onboarding
  if (!onboarded) {
    return <Landing />;
  }

  // Returning user -> full app
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