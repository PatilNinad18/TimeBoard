import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import logger from "./logger.js";
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

// ── Global crash handlers ─────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error("Process", "Uncaught exception", err.message);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Process", "Unhandled promise rejection", String(reason));
});

// ── Safe IPC wrapper — every handler gets try/catch + logging ─────────────
function safeHandle(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      logger.debug("IPC", `${channel} called`, args.length ? args : undefined);
      const result = await handler(event, ...args);
      return result;
    } catch (err) {
      logger.error("IPC", `${channel} failed: ${err.message}`);
      // Return a safe fallback instead of crashing the renderer
      return null;
    }
  });
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");
  const windowIcon = path.join(__dirname, "../frontend/src/assets/time-management.png");
  logger.info("Main", `Creating window | preload exists: ${fs.existsSync(preloadPath)}`);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    title: "TimeBoard",
    icon: path.join(__dirname, "assets/logo.ico"),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  if (isDev) {
  mainWindow.loadURL("http://localhost:5173");
  } else {
    const htmlPath = path.join(
      process.resourcesPath,
      "frontend-dist",
      "index.html"
    );

    console.log("Loading:", htmlPath);
    mainWindow.loadFile(htmlPath);
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.setTitle("TimeBoard");
  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();
  mainWindow.maximize();

  mainWindow.on("crashed", () => {
    logger.error("Main", "Window crashed — attempting reload");
    mainWindow.reload();
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  safeHandle("get-productive-stats", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    logger.info("IPC", "get-productive-stats", { dateFilter, mode });
    return getTodayProductivityStats(dateFilter || null, mode || "single");
  });

  safeHandle("get-usage", () => {
    return getTodayUsage();
  });

  // ── Analytics ─────────────────────────────────────────────────────────────
  safeHandle("get-productive-apps", () => getProductiveApps());

  safeHandle("get-time-distribution", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    return getTimeDistribution(dateFilter || null, mode || "single");
  });

  safeHandle("get-app-breakdown", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    return getAppBreakdown(dateFilter || null, mode || "single");
  });

  safeHandle("get-top-distractions", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    return getTopDistractions(dateFilter || null, mode || "single");
  });

  safeHandle("get-daily-trends", (_, days) => getDailyTrends(days || 7));

  safeHandle("get-focus-sessions", (_, payload) => {
    const { dateFilter, mode } = payload || {};
    return getFocusSessions(25, dateFilter || null, mode || "single");
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  safeHandle("set-productive-apps", (_, apps) => {
    logger.info("IPC", "set-productive-apps", { count: apps?.length });
    const result = setProductiveApps(apps);
    try {
      const all = db.prepare("SELECT DISTINCT app_name FROM app_usage").all().map(r => r.app_name);
      updateDistractingApps(all.filter(a => !(apps || []).includes(a)));
    } catch (err) {
      logger.warn("Main", "Tracker sync failed", err.message);
    }
    return result;
  });

  // ── Reports — now paginated ───────────────────────────────────────────────
  safeHandle("get-report-summary", (_, period) => {
    return getReportSummary(period || "weekly");
  });

  safeHandle("get-report-table", (_, payload) => {
    // payload can be string (legacy) or { period, page, pageSize }
    if (typeof payload === "string") {
      return getReportTable(payload, 1, 10);
    }
    const { period = "weekly", page = 1, pageSize = 10 } = payload || {};
    return getReportTable(period, page, pageSize);
  });

  safeHandle("get-report-csv", (_, period) => {
    return getReportCSV(period || "weekly");
  });

  // ── Activity ──────────────────────────────────────────────────────────────
  safeHandle("get-activity-sessions", (_, dateStr) => {
    return getActivitySessions(dateStr || null);
  });

  // ── AI ────────────────────────────────────────────────────────────────────
  safeHandle("get-ai-insights", () => generateProductivityInsights());

  logger.info("Main", "All IPC handlers registered");

  createWindow();
  startTracking();

  // Sync saved preferences on startup
  try {
    const saved = getProductiveApps();
    if (saved.length > 0) {
      const all = db.prepare("SELECT DISTINCT app_name FROM app_usage").all().map(r => r.app_name);
      updateDistractingApps(all.filter(a => !saved.includes(a)));
      logger.info("Main", `Startup sync — ${saved.length} productive, ${all.length - saved.length} distracting`);
    }
  } catch (err) {
    logger.warn("Main", "Startup sync error", err.message);
  }

  // Health check every 60s
  setInterval(() => {
    try {
      const usage = getTodayUsage();
      const count = db.prepare("SELECT COUNT(*) as c FROM app_usage").get();
      logger.info("Health", `${usage.length} apps today | ${count.c} total records`);
    } catch (err) {
      logger.warn("Health", "Check failed", err.message);
    }
  }, 60000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  logger.info("Main", "All windows closed");
  if (process.platform !== "darwin") app.quit();
});