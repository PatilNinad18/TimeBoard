import React from "react";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts";

// Optional: colors for each app slice
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a28fd0"];

const ProductivityChart = ({data}) => {
  // Ensure data exists and has items
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h4 className="text-lg text-black font-medium mb-3">Time By Application</h4>
        <div className="text-gray-500 text-center py-8">
          No app usage data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <h4 className="text-lg text-black font-medium mb-3">Time By Application</h4>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={1}
            dataKey="minutes"
            nameKey="app"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => `${value} min`} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            formatter={(value, entry) => `${entry.payload.app}: ${entry.payload.minutes} min`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;
