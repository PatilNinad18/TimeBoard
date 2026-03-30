import React from "react";
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts";
// import { data } from "../data/dummyDashboardData"; // Make sure path matches your file

// Optional: colors for each app slice
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a28fd0"];

const ProductivityChart = ({data}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <h4 className="text-lg text-black font-medium mb-3">Time By Application </h4>

      <ResponsiveContainer width="85%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={1}
            dataKey="hours"
            nameKey="app"
            // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            label={({ name, value, percent }) => `${name} : ${value} hrs`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => `${value} hrs`} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            />
            </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;
