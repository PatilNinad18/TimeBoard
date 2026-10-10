import React from "react";

// Display-only component: shows today's top app usage and their authoritative category.
// App classification is managed exclusively from Settings → Distracting Apps.

function AppUsage({ apps = [] }) {
  const getLabelStyle = (category) => {
    if (category === "Distracting") {
      return {
        background: "var(--distracting-bg)",
        color: "var(--distracting)",
      };
    }
    return {
      background: "var(--productive-bg)",
      color: "var(--productive)",
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
      <div className="flex justify-between items-center mb-3">
        <h4
          className="text-lg font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          App Usage
        </h4>
      </div>

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
                  title={app.app}
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
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={getLabelStyle(app.category)}
                  >
                    {app.category || "Productive"}
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