import React from "react";
import { useUser } from "../context/UserContext";

const DashboardHeader = () => {
  const { userName } = useUser();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome back, {userName || "there"} 👋
        </h2>
        <p className="text-gray-500">{today}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;