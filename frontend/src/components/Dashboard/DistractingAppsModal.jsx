import React, { useState } from "react";
import { appUsageData } from "../data/dummyDashboardData";

function DistractingAppsModal({ onClose, onSave }) {
  const [selectedApps, setSelectedApps] = useState([]);

  const toggleApp = (appName) => {
    setSelectedApps(prev =>
      prev.includes(appName)
        ? prev.filter(a => a !== appName)
        : [...prev, appName]
    );
  };

  const handleSave = () => {
    onSave(selectedApps);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-2">Select your distracting apps</h2>
        <p className="text-gray-500 mb-4 text-sm">
          Choose the apps that distract you the most. Others will be considered productive.
        </p>

        <div className="max-h-60 overflow-y-auto mb-4">
          {appUsageData.map((app, index) => (
            <label
              key={index}
              className="flex items-center justify-between mb-2 cursor-pointer"
            >
              <span>{app.app}</span>
              <input
                type="checkbox"
                checked={selectedApps.includes(app.app)}
                onChange={() => toggleApp(app.app)}
                className="w-4 h-4 accent-red-500"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Skip
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default DistractingAppsModal;
