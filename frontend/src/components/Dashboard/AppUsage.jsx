import React from "react";

function AppUsage({ apps }) {
  const getLabel = (minutes) => {
    if (minutes >= 180) return "Highly Focused";
    if (minutes >= 60)  return "Needs Improvement";
    return "Distracting";
  };

  const getLabelColor = (minutes) => {
    if (minutes >= 180) return "bg-green-100 text-green-700";
    if (minutes >= 60)  return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white text-black rounded-2xl shadow-md p-5">
      <h4 className="text-black text-lg font-medium mb-3">App Usage</h4>
      {apps.length === 0 ? (
        <p className="text-gray-400 text-sm">No app usage data yet.</p>
      ) : (
        <ul className="space-y-2">
          {[...apps]
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, 5)
            .map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0"
              >
                <span className="truncate max-w-[120px]">{app.app}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-mono">{app.minutes}m</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getLabelColor(app.minutes)}`}>
                    {getLabel(app.minutes)}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default AppUsage;