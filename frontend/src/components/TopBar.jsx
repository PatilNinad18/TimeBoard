import React from "react";

import { useEffect, useState } from "react";

const TopBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
      <div className="flex items-center gap-6">
        <span className="text-gray-600">{time}</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-8 h-8 rounded-full border"
        />
      </div>
    </div>
  );
};

export default TopBar;
