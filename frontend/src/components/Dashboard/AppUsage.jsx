import React from "react";

function AppUsage({ apps }) {
  const getLabel = (minutes) => {
    if (minutes >= 180) return "Highly Focused";
    if (minutes >= 60) return "Needs Improvement";
    return "Distracting";
  };

  const getLabelStyle = (minutes) => {
    if (minutes >= 180)
      return {
        background: "var(--productive-bg)",
        color: "var(--productive)",
      };
    if (minutes >= 60)
      return {
        background: "rgba(250,204,21,0.12)",
        color: "#facc15",
      };
    return {
      background: "var(--distracting-bg)",
      color: "var(--distracting)",
    };
  };

  return (
    <div
      className="rounded-2xl shadow-md p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <h4
        className="text-lg font-medium mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        App Usage
      </h4>

      {apps.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>
          No app usage data yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {[...apps]
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, 5)
            .map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center pb-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span
                  className="truncate max-w-[120px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {app.app}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {app.minutes}m
                  </span>

                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={getLabelStyle(app.minutes)}
                  >
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