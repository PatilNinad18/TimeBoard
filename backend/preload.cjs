const { contextBridge, ipcRenderer } = require("electron");

console.log("🚀 Preload script started");

try {
  contextBridge.exposeInMainWorld("api", {

    // Stats — sends { dateFilter, mode } so backend knows single vs range
    getTodayProductivityStats: (dateFilter, mode) => {
      console.log("📊 getTodayProductivityStats | dateFilter:", dateFilter, "| mode:", mode);
      return ipcRenderer.invoke("get-productive-stats", { dateFilter, mode });
    },

    getUsage: () => ipcRenderer.invoke("get-usage"),

    // Analytics — all send { dateFilter, mode }
    getTimeDistribution: (dateFilter, mode) => {
      console.log("📊 getTimeDistribution | dateFilter:", dateFilter, "| mode:", mode);
      return ipcRenderer.invoke("get-time-distribution", { dateFilter, mode });
    },
    getAppBreakdown: (dateFilter, mode) => {
      console.log("📊 getAppBreakdown | dateFilter:", dateFilter, "| mode:", mode);
      return ipcRenderer.invoke("get-app-breakdown", { dateFilter, mode });
    },
    getTopDistractions: (dateFilter, mode) => {
      console.log("📊 getTopDistractions | dateFilter:", dateFilter, "| mode:", mode);
      return ipcRenderer.invoke("get-top-distractions", { dateFilter, mode });
    },
    getDailyTrends: (days) => {
      console.log("📊 getDailyTrends | days:", days);
      return ipcRenderer.invoke("get-daily-trends", days);
    },
    getFocusSessions: (dateFilter, mode) => {
      console.log("📊 getFocusSessions | dateFilter:", dateFilter, "| mode:", mode);
      return ipcRenderer.invoke("get-focus-sessions", { dateFilter, mode });
    },

    // Reports
    getReportSummary: (period) => ipcRenderer.invoke("get-report-summary", period),
    getReportTable:   (period) => ipcRenderer.invoke("get-report-table",   period),
    getReportCSV:     (period) => ipcRenderer.invoke("get-report-csv",     period),

    // Activity
    getActivitySessions: (dateStr) => {
      console.log("⏰ getActivitySessions | date:", dateStr);
      return ipcRenderer.invoke("get-activity-sessions", dateStr);
    },

    // Settings
    setProductiveApps: (apps) => ipcRenderer.invoke("set-productive-apps", apps),
    getProductiveApps: ()     => ipcRenderer.invoke("get-productive-apps"),

    // AI
    getAIInsights: () => ipcRenderer.invoke("get-ai-insights"),
  });

  console.log("✅ All APIs exposed to window.api");
} catch (error) {
  console.error("[Preload] Failed to expose API:", error);
}