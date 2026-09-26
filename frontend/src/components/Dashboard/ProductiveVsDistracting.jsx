import React from "react";

// Display-only component: lists apps segmented into Productive and Distracting.
// App classification is managed exclusively from Settings → Distracting Apps.

function ProductiveVsDistracting({ apps = [] }) {
  const distracting = apps.filter(app => app.category === "Distracting");
  const productive = apps.filter(app => app.category !== "Distracting");

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
          Apps Overview
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Productive */}
        <div>
          <h5
            className="font-semibold mb-2"
            style={{ color: "var(--productive)" }}
          >
            Productive Apps
          </h5>

          <ul className="space-y-1">
            {productive.map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-1"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>
                  {app.app}
                </span>

                <span
                  className="font-medium"
                  style={{ color: "var(--productive)" }}
                >
                  {app.minutes} min
                </span>
              </li>
            ))}

            {productive.length === 0 && (
              <li style={{ color: "var(--text-secondary)" }}>
                No productive apps
              </li>
            )}
          </ul>
        </div>

        {/* Distracting */}
        <div>
          <h5
            className="font-semibold mb-2"
            style={{ color: "var(--distracting)" }}
          >
            Distracting Apps
          </h5>

          <ul className="space-y-1">
            {distracting.map((app, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-1"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>
                  {app.app}
                </span>

                <span
                  className="font-medium"
                  style={{ color: "var(--distracting)" }}
                >
                  {app.minutes} min
                </span>
              </li>
            ))}

            {distracting.length === 0 && (
              <li style={{ color: "var(--text-secondary)" }}>
                No distracting apps
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductiveVsDistracting;
