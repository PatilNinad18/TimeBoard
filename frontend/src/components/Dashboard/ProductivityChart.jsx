import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { productivityData } from "../data/dummyDashboardData";

const ProductivityChart = () => (
  <div className="bg-white rounded-2xl shadow-md p-5">
    <h4 className="text-lg font-medium mb-3">Productivity Trend (Last 7 Days)</h4>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={productivityData}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="focusHours" stroke="#f5c518" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ProductivityChart;
