import React from "react";
import { NavLink } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.png"
import analyticsIcon from "../assets/google-analytics.png"
import settingsIcon from "../assets/setting.png"
import reportsIcon from "../assets/documents.png"
import timeIcon from "../assets/time-management.png"

export default function Sidebar() {
  return (
    <div className="w-80 bg-white text-black p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <img src={timeIcon} alt="TimeBoard Icon" className="w-10 h-10" />
        <h1 style={{ fontSize: '2.2rem' }}>TimeBoard</h1>
      </div>
      <nav className="flex flex-col space-y-3">
        <NavLink
          to="/"
          style={{ color: 'black', textDecoration: 'none' }}
          className={({ isActive }) =>
            ` flex items-center gap-3 p-2 rounded transition-all duration-200 text-xl ${
              isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img 
                src={dashboardIcon} 
                alt="Dashboard" 
                className="w-8 h-8 transition-all duration-200" 
                style={{ filter: isActive ? 'none' : 'grayscale(100%)' }}
              />
              Dashboard
            </>
          )}
        </NavLink>

        <NavLink
          to="/analytics"
          style={{ color: 'black', textDecoration: 'none' }}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded transition-all duration-200 text-xl ${
              isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img 
                src={analyticsIcon} 
                alt="Analytics" 
                className="w-7 h-7 transition-all duration-200" 
                style={{ filter: isActive ? 'none' : 'grayscale(100%)' }}
              />
              Analytics
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          style={{ color: 'black', textDecoration: 'none' }}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded transition-all duration-200 text-xl ${
              isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img 
                src={settingsIcon} 
                alt="Settings" 
                className="w-8 h-8 transition-all duration-200" 
                style={{ filter: isActive ? 'none' : 'grayscale(100%)' }}
              />
              Settings
            </>
          )}
        </NavLink>

        <NavLink
          to="/reports"
          style={{ color: 'black', textDecoration: 'none' }}
          className={({isActive})=>
            `flex items-center gap-3 p-2 rounded transition-all duration-200 text-xl ${
              isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img 
                src={reportsIcon} 
                alt="Reports" 
                className="w-8 h-8 transition-all duration-200" 
                style={{ filter: isActive ? 'none' : 'grayscale(100%)' }}
              />
              Reports
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}