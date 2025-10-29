import React from "react";
import { appUsageData } from "../data/dummyDashboardData";

function ProductiveVsDistracting({ distractingApps = [] }) {
  // Classify apps based on what user selected in LandingPage
  const distracting = appUsageData.filter(app =>
    distractingApps.includes(app.app)
  );

  const productive = appUsageData.filter(
    app => !distractingApps.includes(app.app)
  );

  return (
    <div className="bg-white text-black rounded-2xl shadow-md p-5">
      <h4 className="text-black text-lg font-medium mb-3">Apps Overview</h4>
      <div className="grid grid-cols-2 gap-4">
        {/* ✅ Productive Apps */}
        <div>
          <h5 className="font-semibold mb-2 text-green-700">Productive Apps</h5>
          <ul className="space-y-1">
            {productive.map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b border-gray-100 py-1"
              >
                <span>{app.app}</span>
                <span className="text-green-700 font-medium">{app.hours} hrs</span>
              </li>
            ))}
            {productive.length === 0 && (
              <li className="text-gray-400">No productive apps</li>
            )}
          </ul>
        </div>

        {/* 🚫 Distracting Apps */}
        <div>
          <h5 className="font-semibold mb-2 text-red-700">Distracting Apps</h5>
          <ul className="space-y-1">
            {distracting.map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b border-gray-100 py-1"
              >
                <span>{app.app}</span>
                <span className="text-red-700 font-medium">{app.hours} hrs</span>
              </li>
            ))}
            {distracting.length === 0 && (
              <li className="text-gray-400">No distracting apps</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductiveVsDistracting;
