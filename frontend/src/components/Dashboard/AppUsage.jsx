import React from 'react';
// import { appUsageData } from "../data/dummyDashboardData";

function AppUsage({apps}) {

    const getFocusLabel = (seconds) => {

        const hours = seconds / 3600

        if (hours >= 3) return "Highly Focused";
        if (hours >= 1) return "Needs Improvement";
        return "Distracting";
    };

    const getLabelColor = (seconds) => {

        const hours = seconds/3600;

        if (hours >= 3) return "bg-green-100 text-green-700";
        if (hours >= 1) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <div className='bg-white text-black rounded-2xl shadow-md p-5'>
            <h4 className="text-black text-lg font-medium ">App Usage</h4>
            <ul className='space-y-2'>
                {apps
                  .sort((a, b) => b.hours - a.hours) // Sort descending by hours
                  .slice(0, 5) // Take top 4 apps
                  .map((apps, index) => (
                    <li key={index} className='flex justify-between  items-center border-b-0 pb-2'>
                        <span>{apps.app}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{apps.hours} hrs</span>
                            <span
                                className={`text-xs px-2 py-1 rounded ${getLabelColor(apps.hours)}`}
                            >
                                {getFocusLabel(apps.hours)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AppUsage;
