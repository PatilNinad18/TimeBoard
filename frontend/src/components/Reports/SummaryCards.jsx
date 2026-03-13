import React from "react";

const SummaryCards = ({ title, value }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
    {/* <div className="text-yellow-400 text-2xl">{icon}</div> */}
    <div>
      <p className="text-2xl font-semibold text-black ">{title}</p>
      <h3 className="text-3xl font-semibold text-blue-400">{value}</h3>
    </div>
  </div>
);

export default SummaryCards;
