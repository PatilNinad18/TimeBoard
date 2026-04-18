import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName]           = useState("");
  const [distractingApps, setDistractingApps] = useState([]);
  const [onboarded, setOnboarded]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("timeboard_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserName(parsed.userName || "");
      setDistractingApps(parsed.distractingApps || []);
      setOnboarded(parsed.onboarded || false);
    }
    setLoading(false);
  }, []);

  const saveUser = async (name, distApps) => {
    const data = { userName: name, distractingApps: distApps, onboarded: true };
    localStorage.setItem("timeboard_user", JSON.stringify(data));
    setUserName(name);
    setDistractingApps(distApps);
    setOnboarded(true);

    // Also save to backend so productivity score is calculated correctly
    if (window.api) {
      try {
        // Mark non-distracting tracked apps as productive
        const usage = await window.api.getUsage();
        if (usage?.length > 0) {
          const prodApps = usage
            .filter((u) => !distApps.includes(u.app))
            .map((u) => u.app);
          await window.api.setProductiveApps(prodApps);
        }
      } catch (err) {
        console.error("UserContext saveUser error:", err);
      }
    }
  };

  const updateDistractingApps = async (apps) => {
    console.log("[UserContext] updateDistractingApps called with:", apps);
    const current = JSON.parse(localStorage.getItem("timeboard_user") || "{}");
    const updated = { ...current, distractingApps: apps };
    localStorage.setItem("timeboard_user", JSON.stringify(updated));
    setDistractingApps(apps);

    if (window.api) {
      try {
        const usage = await window.api.getUsage();
        if (usage?.length > 0) {
          const prodApps = usage
            .filter((u) => !apps.includes(u.app))
            .map((u) => u.app);
          console.log("[UserContext] Setting productive apps to:", prodApps);
          await window.api.setProductiveApps(prodApps);
        }
      } catch (err) {
        console.error("updateDistractingApps error:", err);
      }
    }

    // Trigger refresh for all components after a small delay to ensure backend updates
    console.log("[UserContext] Triggering refresh after delay...");
    setTimeout(() => {
      setRefreshTrigger(prev => {
        const newTrigger = prev + 1;
        console.log("[UserContext] Refresh trigger updated to:", newTrigger);
        return newTrigger;
      });
    }, 500); // 500ms delay
  };

  return (
    <UserContext.Provider value={{
      userName, distractingApps, onboarded, loading, refreshTrigger,
      saveUser, updateDistractingApps,
      setUserName, setDistractingApps,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}