import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getTodayUsage }              from "./services/dataAggregator.js";
import startTracking, { updateDistractingApps } from "./services/appTracker.js";
import { generateProductivityInsights }         from "./services/aiInsightsService.js";
import { getTodayProductivityStats }            from "./services/statsService.js";
import { setProductiveApps, getProductiveApps } from "./services/productivityService.js";
import {
  getAppBreakdown, getTopDistractions,
  getDailyTrends,  getFocusSessions, getTimeDistribution,
} from "./services/analyticsService.js";
import { getReportSummary, getReportTable, getReportCSV } from "./services/reportsService.js";
import { getActivitySessions } from "./services/activityService.js";
import db from "./db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const isDev      = !app.isPackaged;
let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");
  console.log("[Main] Preload:", preloadPath, "| exists:", fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  isDev
    ? mainWindow.loadURL("http://localhost:5173") && mainWindow.webContents.openDevTools()
    : mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
}

app.whenReady().then(() => {

  // ── Stats — receives { dateFilter, mode } object from frontend ────────────
  ipcMain.handle("get-productive-stats", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    console.log("[IPC] get-productive-stats | dateFilter:", dateFilter, "| mode:", mode);
    return getTodayProductivityStats(dateFilter || null, mode || "single");
  });

  ipcMain.handle("get-usage", () => getTodayUsage());

  // ── Analytics — all receive { dateFilter, mode } ─────────────────────────
  ipcMain.handle("get-productive-apps",   () => getProductiveApps());

  ipcMain.handle("get-time-distribution", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    console.log("[IPC] get-time-distribution | dateFilter:", dateFilter, "| mode:", mode);
    return getTimeDistribution(dateFilter || null, mode || "single");
  });

  ipcMain.handle("get-app-breakdown", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    console.log("[IPC] get-app-breakdown | dateFilter:", dateFilter, "| mode:", mode);
    return getAppBreakdown(dateFilter || null, mode || "single");
  });

  ipcMain.handle("get-top-distractions", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    console.log("[IPC] get-top-distractions | dateFilter:", dateFilter, "| mode:", mode);
    return getTopDistractions(dateFilter || null, mode || "single");
  });

  ipcMain.handle("get-daily-trends", (_, days) => {
    console.log("[IPC] get-daily-trends | days:", days);
    return getDailyTrends(days || 7);
  });

  ipcMain.handle("get-focus-sessions", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    console.log("[IPC] get-focus-sessions | dateFilter:", dateFilter, "| mode:", mode);
    return getFocusSessions(25, dateFilter || null, mode || "single");
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  ipcMain.handle("set-productive-apps", (_, apps) => {
    console.log("[IPC] set-productive-apps:", apps);
    const result = setProductiveApps(apps);
    try {
      const all = db.prepare("SELECT DISTINCT app_name FROM app_usage").all().map(r => r.app_name);
      updateDistractingApps(all.filter(a => !apps.includes(a)));
    } catch (err) {
      console.error("[Main] Tracker sync error:", err.message);
    }
    return result;
  });

  // ── Reports ───────────────────────────────────────────────────────────────
  ipcMain.handle("get-report-summary", (_, period) => getReportSummary(period || "weekly"));
  ipcMain.handle("get-report-table",   (_, period) => getReportTable(period   || "weekly"));
  ipcMain.handle("get-report-csv",     (_, period) => getReportCSV(period     || "weekly"));

  // ── Activity ──────────────────────────────────────────────────────────────
  ipcMain.handle("get-activity-sessions", (_, dateStr) => {
    console.log("[IPC] get-activity-sessions | date:", dateStr);
    return getActivitySessions(dateStr || null);
  });

  // ── AI ────────────────────────────────────────────────────────────────────
  ipcMain.handle("get-ai-insights", () => generateProductivityInsights());

  console.log("✅ All IPC handlers registered");
  createWindow();
  startTracking();

  // Sync productive apps from DB on startup
  try {
    const saved = getProductiveApps();
    if (saved.length > 0) {
      const all = db.prepare("SELECT DISTINCT app_name FROM app_usage").all().map(r => r.app_name);
      updateDistractingApps(all.filter(a => !saved.includes(a)));
      console.log("[Main] Startup sync complete");
    }
  } catch (err) {
    console.error("[Main] Startup sync error:", err.message);
  }

  setInterval(() => {
    try { console.log("[Main] Snapshot:", getTodayUsage().slice(0,3)); }
    catch (e) { /* ignore */ }
  }, 30000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});