import React from "react";
import {FaClock } from "react-icons/fa"; // 🎯 Optional icon (feel free to change it)

function IntroSection({ onGetStarted }) {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-300 text-center">
      <div className="bg-white p-16 rounded-3xl shadow-xl max-w-4xl w-[90%] mx-auto border border-gray-200">
        <div className="flex flex-col items-center">
          <FaClock className="text-blue-600 text-6xl mb-6" />

          <h1 className="text-6xl font-extrabold mb-6 text-blue-700 drop-shadow-sm">
            Welcome to FocusTrack
          </h1>

          <p className="text-gray-600 mb-10 leading-relaxed text-xl max-w-2xl">
            Stay focused, track your productivity, and eliminate distractions effortlessly.  
            Choose your distracting apps and start improving your focus today.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 text-white font-semibold py-4 px-12 rounded-full text-xl shadow-md"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntroSection;
