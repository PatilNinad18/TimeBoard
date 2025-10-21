import React from "react";

const DashboardHeader = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Welcome back, Ninad 👋</h2>
        <p className="text-gray-500">{today}</p>
      </div>
      <img
        src="https://avatars.githubusercontent.com/u/9919?v=4"
        alt="User Avatar"
        className="w-10 h-10 rounded-full border border-gray-300"
      />
    </div>
  );
};

export default DashboardHeader;
