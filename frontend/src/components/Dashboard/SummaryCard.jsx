import React from "react";

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
    <div className="text-yellow-400 text-2xl">{icon}</div>
    <div>
      <p className="text-sm text-black">{title}</p>
      <h3 className="text-lg text-black font-semibold">{value}</h3>
    </div>
  </div>
);

export default SummaryCard;
