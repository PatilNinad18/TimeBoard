import React from "react";

function ReportsHeader() {
  return (
    <header className="flex justify-between items-center bg-white/80 backdrop-blur-lg border border-gray-200 shadow-md p-5 rounded-2xl mb-6">
      {/* Left Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
          <h3 className="text-3xl font-semibold text-gray-800 tracking-tight">
            Productivity Overview
          </h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Track your daily and weekly productivity insights
        </p>
      </div>

      
    </header>
  );
}

export default ReportsHeader;
