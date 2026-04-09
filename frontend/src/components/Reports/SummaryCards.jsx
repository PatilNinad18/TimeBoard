import React from "react";

const SummaryCards = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition w-full">
    <div>
      <p className="text-2xl font-semibold text-black">{title}</p>
      <h3 className="text-3xl font-semibold text-blue-400">{value}</h3>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  </div>
);

export default SummaryCards;
