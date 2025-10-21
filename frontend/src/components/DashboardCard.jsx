import React from "react";

const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="flex items-center gap-4 bg-white shadow-sm rounded-2xl p-5 w-full hover:shadow-md transition">
      <div className="p-3 bg-indigo-100 rounded-xl">{icon}</div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
