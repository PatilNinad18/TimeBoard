import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userName,        setUserName]        = useState("");
  const [distractingApps, setDistractingApps] = useState([]);
  const [onboarded,       setOnboarded]       = useState(false);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("timeboard_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserName(parsed.userName || "");
        // Always ensure it's an array, never undefined/null
        setDistractingApps(
          Array.isArray(parsed.distractingApps) ? parsed.distractingApps : []
        );
        setOnboarded(!!parsed.onboarded);
      }
    } catch (err) {
      console.error("[UserContext] Failed to load from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUser = async (name, distApps) => {
    const apps = Array.isArray(distApps) ? distApps : [];
    const data = { userName: name, distractingApps: apps, onboarded: true };
    localStorage.setItem("timeboard_user", JSON.stringify(data));
    setUserName(name);
    setDistractingApps(apps);
    setOnboarded(true);

    if (window.api) {
      try {
        const usage = await window.api.getUsage();
        if (usage?.length > 0) {
          const prodApps = usage.filter(u => !apps.includes(u.app)).map(u => u.app);
          await window.api.setProductiveApps(prodApps);
        }
      } catch (err) {
        console.error("[UserContext] saveUser sync error:", err);
      }
    }
  };

  const updateDistractingApps = async (apps) => {
    const safeApps = Array.isArray(apps) ? apps : [];
    try {
      const current = JSON.parse(localStorage.getItem("timeboard_user") || "{}");
      localStorage.setItem("timeboard_user", JSON.stringify({
        ...current,
        distractingApps: safeApps,
      }));
    } catch (err) {
      console.error("[UserContext] updateDistractingApps storage error:", err);
    }
    setDistractingApps(safeApps);

    if (window.api) {
      try {
        const usage = await window.api.getUsage();
        if (usage?.length > 0) {
          const prodApps = usage.filter(u => !safeApps.includes(u.app)).map(u => u.app);
          await window.api.setProductiveApps(prodApps);
        }
      } catch (err) {
        console.error("[UserContext] updateDistractingApps sync error:", err);
      }
    }
  };

  return (
    <UserContext.Provider value={{
      userName,
      distractingApps,  // always an array
      onboarded,
      loading,
      saveUser,
      updateDistractingApps,
      setUserName,
      setDistractingApps,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}