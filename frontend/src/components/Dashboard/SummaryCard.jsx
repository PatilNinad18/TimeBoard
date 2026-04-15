import React from "react";

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
    <div 
      className="text-2xl flex-shrink-0"
      style={{ color: 'var(--accent-color)' }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{title}</p>
      <h3 className="text-2xl text-black font-bold font-mono tracking-tight">{value}</h3>
    </div>
  </div>
);

export default SummaryCard;