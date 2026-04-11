const { contextBridge, ipcRenderer } = require("electron");

console.log("🚀 Preload script started");

try {
  contextBridge.exposeInMainWorld("api", {
    // Dashboard & Analytics
    getTodayProductivityStats: () => {
      console.log("📊 getTodayProductivityStats called");
      return ipcRenderer.invoke("get-productive-stats");
    },
    getUsage: () => {
      console.log("📊 getUsage called");
      return ipcRenderer.invoke("get-usage");
    },

    // Analytics
    getTimeDistribution: () => {
      console.log("📊 getTimeDistribution called");
      return ipcRenderer.invoke("get-time-distribution");
    },
    getAppBreakdown: () => {
      console.log("📊 getAppBreakdown called");
      return ipcRenderer.invoke("get-app-breakdown");
    },
    getTopDistractions: () => {
      console.log("📊 getTopDistractions called");
      return ipcRenderer.invoke("get-top-distractions");
    },
    getDailyTrends: (days) => {
      console.log("📊 getDailyTrends called");
      return ipcRenderer.invoke("get-daily-trends", days);
    },
    getFocusSessions: () => {
      console.log("📊 getFocusSessions called");
      return ipcRenderer.invoke("get-focus-sessions");
    },

    // Reports
    getReportSummary: (period) => {
      console.log("📋 getReportSummary called");
      return ipcRenderer.invoke("get-report-summary", period);
    },
    getReportTable: (period) => {
      console.log("📋 getReportTable called");
      return ipcRenderer.invoke("get-report-table", period);
    },
    getReportCSV: (period) => {
      console.log("📋 getReportCSV called");
      return ipcRenderer.invoke("get-report-csv", period);
    },

    // Activity
    getActivitySessions: (dateStr) => {
      console.log("⏰ getActivitySessions called");
      return ipcRenderer.invoke("get-activity-sessions", dateStr);
    },

    // Settings
    setProductiveApps: (apps) => {
      console.log("⚙️ setProductiveApps called");
      return ipcRenderer.invoke("set-productive-apps", apps);
    },
    getProductiveApps: () => {
      console.log("⚙️ getProductiveApps called");
      return ipcRenderer.invoke("get-productive-apps");
    },

    // AI Insights
    getAIInsights: () => {
      console.log("🤖 getAIInsights called");
      return ipcRenderer.invoke("get-ai-insights");
    }
  });

  console.log("✅ All APIs exposed to window.api");
} catch (error) {
  console.error("[Preload] Failed to expose API:", error);
}