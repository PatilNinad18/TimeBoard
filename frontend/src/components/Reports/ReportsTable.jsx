import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ScoreBadge = ({ score }) => {
  let color = "#6B7280";
  let bg = "#F3F4F6";
  if (score >= 70) { color = "#16A34A"; bg = "#DCFCE7"; }
  else if (score >= 40) { color = "#CA8A04"; bg = "#FEF9C3"; }
  else if (score > 0) { color = "#DC2626"; bg = "#FEE2E2"; }

  return (
    <span
      style={{
        background: bg,
        color: color,
        padding: "4px 10px",
        borderRadius: "12px",
        fontWeight: 600,
        fontSize: "13px",
      }}
    >
      {score}%
    </span>
  );
};

function ReportsTable({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
        Loading report data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
        <p className="text-lg">No data available yet</p>
        <p className="text-sm mt-2">Start using apps and TimeBoard will track your productivity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Day</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Total Time</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Productive</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Distracting</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Idle</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Focus Score</th>
            <th className="px-5 py-4 text-sm font-semibold text-gray-600">Top App</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 text-sm font-medium text-gray-800">{row.date}</td>
              <td className="px-5 py-4 text-sm text-gray-600">{row.dayName}</td>
              <td className="px-5 py-4 text-sm text-gray-700">{row.totalTime}</td>
              <td className="px-5 py-4 text-sm text-green-600 font-medium">{row.productiveTime}</td>
              <td className="px-5 py-4 text-sm text-red-500 font-medium">{row.distractingTime}</td>
              <td className="px-5 py-4 text-sm text-gray-400">{row.idleTime}</td>
              <td className="px-5 py-4"><ScoreBadge score={row.focusScore} /></td>
              <td className="px-5 py-4 text-sm text-gray-600">{row.topApp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportsTable;
