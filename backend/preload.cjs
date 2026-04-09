const { contextBridge, ipcRenderer } = require("electron");

try {
  contextBridge.exposeInMainWorld("api", {
    // Dashboard & Analytics
    getTodayProductivityStats: () => ipcRenderer.invoke("get-productive-stats"),
    getUsage: () => ipcRenderer.invoke("get-usage"),

    // Productivity apps management
    setProductiveApps: (apps) => ipcRenderer.invoke("set-productive-apps", apps),
    getProductiveApps: () => ipcRenderer.invoke("get-productive-apps"),

    // Analytics
    getTimeDistribution: () => ipcRenderer.invoke("get-time-distribution"),
    getAppBreakdown: () => ipcRenderer.invoke("get-app-breakdown"),
    getTopDistractions: () => ipcRenderer.invoke("get-top-distractions"),
    getDailyTrends: (days) => ipcRenderer.invoke("get-daily-trends", days),
    getFocusSessions: () => ipcRenderer.invoke("get-focus-sessions"),

    // Reports
    getReportSummary: (period) => ipcRenderer.invoke("get-report-summary", period),
    getReportTable: (period) => ipcRenderer.invoke("get-report-table", period),
    getReportCSV: (period) => ipcRenderer.invoke("get-report-csv", period),

    // Activity
    getActivitySessions: (dateStr) => ipcRenderer.invoke("get-activity-sessions", dateStr),
  });

  console.log("[Preload] API exposed to window.api successfully");
} catch (error) {
  console.error("[Preload] Failed to expose API:", error);
}