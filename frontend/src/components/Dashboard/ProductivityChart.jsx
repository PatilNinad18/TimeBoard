import React, { useEffect, useState } from "react";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a28fd0"];

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

  const empty = (
    <div className="chart-empty">No app usage data yet</div>
  );

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">Time By Application</h4>
        {lastUpdated && (
          <span className="chart-updated">Updated: {lastUpdated}</span>
        )}
      </div>

      {validData.length === 0 ? empty : (
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={validData}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 46 : 70}
                outerRadius={compact ? 82 : 120}
                paddingAngle={1}
                dataKey="minutes"
                nameKey="app"
                label={!compact ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                labelLine={!compact}
              >
                {validData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} min`} />
              <Legend
                layout={compact ? "horizontal" : "vertical"}
                verticalAlign={compact ? "bottom" : "middle"}
                align={compact ? "center" : "right"}
                iconType="circle"
                formatter={(_, entry) =>
                  `${entry.payload.app}: ${entry.payload.minutes} min`
                }
                wrapperStyle={compact ? { paddingTop: 12, fontSize: 12 } : undefined}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;