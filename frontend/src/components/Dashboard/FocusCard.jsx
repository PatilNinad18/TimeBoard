import React from 'react'
import { useState } from 'react'


function FocusCard({score}) {

    // const [progress, setProgress] = useState(0)
    const progress = Math.round(score);
    const circumference = 2 * Math.PI * 45; // 2πr for r=45

    return (
        <div
          className="rounded-2xl shadow-lg transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
            <div className='p-3 flex justify-center'>
                <div
                  className="font-semibold font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  Focus Score
                </div>
            </div>
            <div className='p-2 flex justify-center'>
                <div className="relative">
                    <svg height="100" width="100" viewBox="0 0 100 100">
                        {/* Gradient Definition */}
                        <defs>
                          <linearGradient id="blueTealGradient">
                            <stop offset="0%" stopColor="#00B4DB" />
                            <stop offset="100%" stopColor="#00FFA3" />
                          </linearGradient>
                        </defs>
                      <circle
                        r="45"
                        cx="50"
                        cy="50"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth={10}
                      />
                      
                      <circle
                        r="45"
                        cx="50"
                        cy="50"
                        fill="none"
                        stroke="url(#blueTealGradient)"
                        transform="rotate(-90 50 50)"
                        strokeWidth={10}
                        strokeDasharray={circumference}
                        strokeDashoffset={
                          circumference - (progress / 100) * circumference
                        }
                        strokeLinecap="round"
                      />
                    </svg> 
                    <div
                      className="absolute inset-0 flex justify-center items-center font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                       {progress}%
                     </div>
                </div>
                {/* <button className='bg-blue-500 text-white font-bold py-2 px-4 rounded w-30 flex justify-center h-20' */}
                {/* onClick={()=>{ */}
                    {/* setProgress((prev) => (prev >= 100 ? 0 : prev + 10)) */}
                {/* }} */}
                {/* >Increase Progress</button> */}
            </div>
        </div>
    )
}

export default FocusCard
