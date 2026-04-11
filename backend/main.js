import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getTodayUsage } from "./services/dataAggregator.js";
import startTracking from "./services/appTracker.js";
import { generateProductivityInsights } from "./services/aiInsightsService.js";
import "./ipc/statsHandlers.js";
import { getTodayProductivityStats } from "./services/statsService.js";
import { setProductiveApps, getProductiveApps } from "./services/productivityService.js";
import { 
  getAppBreakdown, 
  getTopDistractions, 
  getDailyTrends, 
  getFocusSessions, 
  getTimeDistribution 
} from "./services/analyticsService.js";
import { 
  getReportSummary, 
  getReportTable, 
  getReportCSV 
} from "./services/reportsService.js";
import { getActivitySessions } from "./services/activityService.js";

// recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  console.log(" Creating window with preload:", preloadPath);
  console.log(" Preload exists:", fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../frontend/dist/index.html")
    );
  }
}

app.whenReady().then(() => {
  // Register IPC handlers BEFORE creating the window
  // Register all IPC handlers
  ipcMain.handle("get-productive-stats", () => {
    console.log("📊 get-productive-stats handler called");
    const stats = getTodayProductivityStats();
    console.log("📊 Returning stats data:", stats);
    return stats;
  });

  ipcMain.handle("get-usage", ()=>{
    console.log(" get-usage handler called");
    const usage = getTodayUsage();
    console.log(" Returning usage data:", usage);
    return usage;
  });

  // Analytics handlers
  ipcMain.handle("get-productive-apps", () => {
    console.log("[IPC] get-productive-apps called");
    return getProductiveApps();
  });

  ipcMain.handle("get-time-distribution", () => {
    console.log("[IPC] get-time-distribution called");
    return getTimeDistribution();
  });

  ipcMain.handle("get-app-breakdown", () => {
    console.log("[IPC] get-app-breakdown called");
    return getAppBreakdown();
  });

  ipcMain.handle("get-top-distractions", () => {
    console.log("[IPC] get-top-distractions called");
    return getTopDistractions();
  });

  ipcMain.handle("get-daily-trends", (_, days) => {
    console.log("[IPC] get-daily-trends called");
    return getDailyTrends(days || 7);
  });

  ipcMain.handle("get-focus-sessions", () => {
    console.log("[IPC] get-focus-sessions called");
    return getFocusSessions();
  });

  // Settings handlers
  ipcMain.handle("set-productive-apps", (event, apps) => {
    console.log(" set-productive-apps handler called with apps:", apps);
    return setProductiveApps(apps);
  });

  // Reports
  ipcMain.handle("get-report-summary", (_, period) => {
    console.log("[IPC] get-report-summary called, period:", period);
    return getReportSummary(period || "weekly");
  });

  ipcMain.handle("get-report-table", (_, period) => {
    console.log("[IPC] get-report-table called, period:", period);
    return getReportTable(period || "weekly");
  });

  ipcMain.handle("get-report-csv", (_, period) => {
    console.log("[IPC] get-report-csv called, period:", period);
    return getReportCSV(period || "weekly");
  });

  // Activity
  ipcMain.handle("get-activity-sessions", (_, dateStr) => {
    console.log("[IPC] get-activity-sessions called, date:", dateStr);
    return getActivitySessions(dateStr || null);
  });

  // AI Insights handler
ipcMain.handle("get-ai-insights", () => {
  console.log("🤖 get-ai-insights handler called");
  const insights = generateProductivityInsights();
  console.log("🤖 AI insights generated:", insights);
  return insights;
});

console.log("✅ All IPC handlers registered");

  createWindow();

  // Start app usage tracking
  startTracking();

  // Periodic logging
  setInterval(() => {
    const usage = getTodayUsage();
    console.log("------ COMBINED DATA ------");
    console.log(usage);
  }, 10000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});