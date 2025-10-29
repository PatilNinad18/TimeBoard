import React, { useState } from "react";
import DistractingAppsModal from "../DistractingAppsModal";
import IntroSection from "./IntroSection";

function LandingPage({ onComplete }) {
  const [selectedApps, setSelectedApps] = useState([]);
  const [step, setStep] = useState("intro"); // intro → modal

  const handleGetStarted = () => setStep("modal");

  const handleSave = () => {
    // send selected apps back to App.jsx
    onComplete({ distractingApps: selectedApps });
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-100 text-gray-900">
      {step === "intro" ? (
        <IntroSection onGetStarted={handleGetStarted} />
      ) : (
        <DistractingAppsModal
          selectedApps={selectedApps}
          setSelectedApps={setSelectedApps}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default LandingPage;
