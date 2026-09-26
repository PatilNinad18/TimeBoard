import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#a28fd0",
  "#b0b0b0",
];

const RADIAN = Math.PI / 180;

function renderLeaderLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  index,
}) {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;

  const mx = cx + (outerRadius + 35) * cos;
  const my = cy + (outerRadius + 35) * sin;

  const ex = mx + (cos >= 0 ? 28 : -28);
  const ey = my;

  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={COLORS[index % COLORS.length]}
        fill="none"
        strokeWidth={1}
      />

      <text
        x={ex + (cos >= 0 ? 4 : -4)}
        y={ey}
        dy={4}
        textAnchor={cos >= 0 ? "start" : "end"}
        fontSize={12}
        fill="#555"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
}

const TOP_APPS_COUNT = 5;

function groupSmallSlices(items) {
  const sorted = [...items].sort((a, b) => b.minutes - a.minutes);

  if (sorted.length <= TOP_APPS_COUNT) return sorted;

  const top = sorted.slice(0, TOP_APPS_COUNT);
  const rest = sorted.slice(TOP_APPS_COUNT);

  const otherMinutes = rest.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  return [
    ...top,
    {
      app: "Other",
      name: "Other",
      minutes: otherMinutes,
      isOther: true,
      apps: rest,
    },
  ].sort((a, b) => b.minutes - a.minutes);
}

const ProductivityChart = ({ data, lastUpdated }) => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updateCompact = () => setCompact(window.innerWidth <= 640);

    updateCompact();

    window.addEventListener("resize", updateCompact);

    return () => window.removeEventListener("resize", updateCompact);
  }, []);

  const validData = (data || []).filter(
    (item) =>
      item &&
      (item.app || item.name) &&
      item.minutes != null &&
      !isNaN(item.minutes) &&
      item.minutes > 0
  );

  const chartData = groupSmallSlices(validData);

  return (
    <div className="chart-card">
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: 0 }}>Time By Application</h3>

        {lastUpdated && (
          <span style={{ color: "#888", fontSize: 14 }}>
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      {validData.length === 0 ? (
        <div>No app usage data yet</div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: compact ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: 420,
            gap: 30,
          }}
        >
          {/* PIE CHART */}

          <div style={{ flex: 1, height: "100%", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                margin={{
                  top: 30,
                  right: 90,
                  bottom: 30,
                  left: 120,
                }}
              >
                <Pie
                  data={chartData}
                  cx={compact ? "50%" : "42%"}
                  cy="50%"
                  innerRadius={compact ? 45 : 70}
                  outerRadius={compact ? 82 : 120}
                  paddingAngle={1}
                  dataKey="minutes"
                  nameKey="app"
                  label={!compact ? renderLeaderLabel : false}
                  labelLine={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.app}
                      fill={
                        entry.isOther
                          ? COLORS[COLORS.length - 1]
                          : COLORS[i % COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, _n, { payload }) =>
                    payload.isOther
                      ? [
                          `${value} min (${payload.apps.length} apps)`,
                          "Other",
                        ]
                      : [`${value} min`, payload.app]
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CUSTOM LEGEND */}

          <div
            style={{
              width: compact ? "100%" : 260,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {chartData.map((item, index) => (
              <div
                key={item.app}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    marginRight: 8,
                    backgroundColor: item.isOther
                      ? COLORS[COLORS.length - 1]
                      : COLORS[index % COLORS.length],
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    color: item.isOther
                      ? COLORS[COLORS.length - 1]
                      : COLORS[index % COLORS.length],
                    fontSize: 13,        // Smaller text
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.app}: {item.minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;