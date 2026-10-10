import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName, setUserName]           = useState("");
  const [distractingApps, setDistractingApps] = useState([]);
  const [onboarded, setOnboarded]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Load from database / localStorage on mount
  useEffect(() => {
    async function initUser() {
      const saved = localStorage.getItem("timeboard_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserName(parsed.userName || "");
          setOnboarded(parsed.onboarded || false);
        } catch (e) {
          console.error("User parsing error:", e);
        }
      }

      if (window.api?.getBlockedApps) {
        try {
          const blocked = await window.api.getBlockedApps();
          setDistractingApps(blocked || []);
        } catch (err) {
          console.error("UserContext init error:", err);
        }
      }
      setLoading(false);
    }

    initUser();
  }, []);

  const saveUser = async (name, distApps) => {
    const data = { userName: name, distractingApps: distApps, onboarded: true };
    localStorage.setItem("timeboard_user", JSON.stringify(data));
    setUserName(name);
    setDistractingApps(distApps || []);
    setOnboarded(true);

    if (window.api?.setBlockedApps) {
      try {
        await window.api.setBlockedApps(distApps || []);
      } catch (err) {
        console.error("UserContext saveUser error:", err);
      }
    }
    triggerRefresh();
  };

  const updateDistractingApps = async (apps) => {
    console.log("[UserContext] updateDistractingApps called with:", apps);
    setDistractingApps(apps || []);
    if (window.api?.setBlockedApps) {
      try {
        await window.api.setBlockedApps(apps || []);
      } catch (err) {
        console.error("updateDistractingApps error:", err);
      }
    }
    triggerRefresh();
  };

  return (
    <UserContext.Provider value={{
      userName, distractingApps, onboarded, loading, refreshTrigger,
      saveUser, updateDistractingApps, triggerRefresh,
      setUserName, setDistractingApps,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}