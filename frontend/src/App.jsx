import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Dashboard from "./pages/DashboardPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import LandingPage from "./components/LandingPage/LandingPage";
import Sidebar from "./components/Sidebar";

function App() {
  // state to store landing page data
  const [isLandingCompleted, setIsLandingCompleted] = useState(false);
  const [landingData, setLandingData] = useState({
    distractingApps: [],
  });

  const handleLandingComplete = (data) => {
    setLandingData(data); // store selected apps
    setIsLandingCompleted(true); // switch to dashboard
  };

  return (
    <Router>
      {/* {isLandingCompleted ? ( */}
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
          {/* Sidebar */}
          <div className="w-[260px] flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 bg-gray-50 w-full h-full">
            <Routes>
              <Route
                path="/"
                element={<Dashboard landingData={landingData} />}
              />
              <Route path="/dashboard" element={<Dashboard landingData={landingData} />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </div>
      {/* ) : */}
       (
        <LandingPage onComplete={handleLandingComplete} />
      )
      {/* } */}
    </Router>
  );
}

export default App;
