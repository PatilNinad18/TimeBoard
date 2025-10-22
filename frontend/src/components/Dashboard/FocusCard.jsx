import React from 'react'
import { useState } from 'react'
function FocusCard() {

    const [progress, setProgress] = useState(0)
    const circumference = 2 * Math.PI * 45; // 2πr for r=45

    return (
        <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all'>
            <div className=' p-5 flex justify-center gap-4 '>
                <div className='text-black font-semibold font-mono'>Focus Score</div>
            </div>
            <div className='text-black p-5 flex justify-center'>
                <div className="relative">
                    <svg height="100" width="100" viewBox="0 0 100 100">
                        {/* Gradient Definition */}
                        <defs>
                          <linearGradient id="blueTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00B4DB" />
                            <stop offset="100%" stopColor="#00FFA3" />
                          </linearGradient>
                        </defs>
                      <circle r="45" cx="50" cy="50" fill="none" stroke="lightgray" strokeWidth={10} />
                      
                      <circle r="45" cx="50" cy="50" fill="none" stroke="url(#blueTealGradient)" transform="rotate(-90 50 50)" strokeWidth={10} 
                    strokeDasharray={circumference} strokeDashoffset={circumference - (progress / 100) * circumference} strokeLinecap="round" transition="all 0.5s 
                    ease" />
                    </svg> 
                    <div className="absolute inset-0 flex justify-center items-center font-bold font-sans text-black">
                       {progress}%
                     </div>
                </div>
                <button className='bg-blue-500 text-white font-bold py-2 px-4 rounded w-30 flex justify-center h-20'
                onClick={()=>{
                    setProgress((prev) => (prev >= 100 ? 0 : prev + 10))
                }}
                >Increase Progress</button>
            </div>
        </div>
    )
}

export default FocusCard
