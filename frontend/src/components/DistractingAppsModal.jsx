import React, { useState } from "react";
import AppList from "./LandingPage/AppList";
import dummyLandingApps from "./data/dummyLandingPage"

function DistractingAppsModal({ onSave, onClose }) {
  const [apps, setApps] = useState(
    dummyLandingApps.map(app => ({ ...app, selected: false }))
  );

  // ✅ This function is passed to AppList as `onToggle`
  const handleAppToggle = (index) => {
    const updated = [...apps];
    updated[index].selected = !updated[index].selected;
    setApps(updated);
  };

  const handleSave = () => {
    const selectedApps = apps.filter(app => app.selected);
    onSave(selectedApps);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Select Distracting Apps</h2>

      <AppList apps={apps} onToggle={handleAppToggle} />  {/* ✅ FIXED */}

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
      </div>
    </div>
  );
}

export default DistractingAppsModal;
