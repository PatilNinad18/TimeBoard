const { contextBridge, ipcRenderer } = require("electron");

console.log("🚀 Preload script started");

async function safeInvoke(channel, ...args) {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (err) {
    console.error(`[Preload] IPC error on ${channel}:`, err.message);
    return null;
  }
}

try {
  contextBridge.exposeInMainWorld("api", {

    // Stats
    getTodayProductivityStats: (payload) => {
      if (typeof payload === "object" && payload !== null) {
        const { dateFilter, mode } = payload;
        return safeInvoke("get-productive-stats", { dateFilter, mode });
      }
      // Dashboard calls with no args
      return safeInvoke("get-productive-stats", { dateFilter: null, mode: "single" });
    },

    getUsage: () => safeInvoke("get-usage"),

    // Analytics
    getTimeDistribution: (payload) => {
      const { dateFilter, mode } = payload || {};
      return safeInvoke("get-time-distribution", { dateFilter, mode });
    },

    getAppBreakdown: (payload) => {
      const { dateFilter, mode } = payload || {};
      return safeInvoke("get-app-breakdown", { dateFilter, mode });
    },

    getTopDistractions: (payload) => {
      const { dateFilter, mode } = payload || {};
      return safeInvoke("get-top-distractions", { dateFilter, mode });
    },

    // FIX: getDailyTrends receives { days } object from Analytics.jsx
    // but main.js handler expects a plain number — unwrap here
    getDailyTrends: (payload) => {
      const days = typeof payload === "object" ? (payload?.days || 7) : (payload || 7);
      console.log("📊 getDailyTrends | days:", days);
      return safeInvoke("get-daily-trends", days);
    },

    getFocusSessions: (payload) => {
      const { dateFilter, mode } = payload || {};
      return safeInvoke("get-focus-sessions", { dateFilter, mode });
    },

    // Reports
    getReportSummary: (period) => safeInvoke("get-report-summary", period),
    getReportTable:   (period, page, pageSize) => safeInvoke("get-report-table", { period, page, pageSize }),
    getReportCSV:     (period) => safeInvoke("get-report-csv", period),

    // Activity
    getActivitySessions: (dateStr) => safeInvoke("get-activity-sessions", dateStr),

    // Settings
    setProductiveApps: (apps) => safeInvoke("set-productive-apps", apps),
    getProductiveApps: ()     => safeInvoke("get-productive-apps"),

    // AI
    getAIInsights: () => safeInvoke("get-ai-insights"),
  });

  console.log("✅ All APIs exposed to window.api");
} catch (error) {
  console.error("[Preload] Failed to expose API:", error);
}