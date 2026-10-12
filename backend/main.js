import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import logger from "./logger.js";
import { getTodayUsage } from "./services/dataAggregator.js";
import startTracking, {
  updateDistractingApps,
  updateProductiveApps,
} from "./services/appTracker.js";
import { generateProductivityInsights } from "./services/aiInsightsService.js";
import { getTodayProductivityStats } from "./services/statsService.js";
import {
  setProductiveApps,
  getProductiveApps,
} from "./services/productivityService.js";
import {
  setBlockedApps,
  getBlockedApps,
} from "./services/blockChecker.js";
import { setSingleAppClassification } from "./services/classificationService.js";
import {
  getAppBreakdown,
  getTopDistractions,
  getDailyTrends,
  getFocusSessions,
  getTimeDistribution,
} from "./services/analyticsService.js";
import {
  getReportSummary,
  getReportTable,
  getReportCSV,
} from "./services/reportsService.js";
import { getActivitySessions } from "./services/activityService.js";
import db from "./db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow;

// Set TEMP_OPEN_DEVTOOLS=true to enable DevTools temporarily.
// Remove this environment variable after resetting onboarding.
const openDevTools = process.env.TEMP_OPEN_DEVTOOLS === "true";

// Global crash handlers
process.on("uncaughtException", (err) => {
  logger.error("Process", "Uncaught exception", err.message);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Process", "Unhandled promise rejection", String(reason));
});

// Safe IPC wrapper
function safeHandle(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      logger.debug(
        "IPC",
        `${channel} called`,
        args.length ? args : undefined
      );

      return await handler(event, ...args);
    } catch (err) {
      logger.error("IPC", `${channel} failed: ${err.message}`);
      return null;
    }
  });
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  logger.info(
    "Main",
    `Creating window | preload exists: ${fs.existsSync(preloadPath)}`
  );

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

  // Load the correct frontend
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const htmlPath = path.join(
      process.resourcesPath,
      "frontend-dist",
      "index.html"
    );

    logger.info("Main", `Loading frontend: ${htmlPath}`);
    mainWindow.loadFile(htmlPath);
  }

  // Temporary debugging: open DevTools after the page loads.
  if (openDevTools) {
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    });
  }

  mainWindow.setTitle("TimeBoard");
  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();
  mainWindow.maximize();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    logger.error(
      "Main",
      `Renderer process terminated: ${details.reason}`
    );
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  // Stats
  safeHandle("get-productive-stats", (_, payload) => {
    const { dateFilter, mode } = payload || {};

    return getTodayProductivityStats(
      dateFilter || null,
      mode || "single"
    );
  });

  safeHandle("get-usage", () => getTodayUsage());

  // Analytics
  safeHandle("get-time-distribution", (_, payload) => {
    const { dateFilter, mode } = payload || {};

    return getTimeDistribution(
      dateFilter || null,
      mode || "single"
    );
  });

  safeHandle("get-app-breakdown", (_, payload) => {
    const { dateFilter, mode } = payload || {};

    return getAppBreakdown(
      dateFilter || null,
      mode || "single"
    );
  });

  safeHandle("get-top-distractions", (_, payload) => {
    const { dateFilter, mode } = payload || {};

    return getTopDistractions(
      dateFilter || null,
      mode || "single"
    );
  });

  safeHandle("get-daily-trends", (_, days) => {
    return getDailyTrends(days || 7);
  });

  safeHandle("get-focus-sessions", (_, payload) => {
    const { dateFilter, mode } = payload || {};

    return getFocusSessions(
      25,
      dateFilter || null,
      mode || "single"
    );
  });

  // Synchronize saved app classifications with the tracker.
  function syncTrackerLists() {
    try {
      const productive = getProductiveApps();
      const blocked = getBlockedApps();

      updateProductiveApps(productive);
      updateDistractingApps(blocked);

      logger.info(
        "Main",
        `Tracker sync — ${productive.length} productive, ${blocked.length} distracting`
      );
    } catch (err) {
      logger.warn("Main", "Tracker sync error", err.message);
    }
  }

  // Settings and classification
  safeHandle("set-productive-apps", (_, apps) => {
    const result = setProductiveApps(apps);
    syncTrackerLists();
    return result;
  });

  safeHandle("get-productive-apps", () => getProductiveApps());

  safeHandle("set-blocked-apps", (_, apps) => {
    const result = setBlockedApps(apps);
    syncTrackerLists();
    return result;
  });

  safeHandle("get-blocked-apps", () => getBlockedApps());

  safeHandle("set-app-classification", (_, payload) => {
    const { appName, category } = payload || {};

    setSingleAppClassification(appName, category);
    syncTrackerLists();

    return { success: true };
  });

  // Reports
  safeHandle("get-report-summary", (_, period) => {
    return getReportSummary(period || "weekly");
  });

  safeHandle("get-report-table", (_, payload) => {
    if (typeof payload === "string") {
      return getReportTable(payload, 1, 10);
    }

    const {
      period = "weekly",
      page = 1,
      pageSize = 10,
    } = payload || {};

    return getReportTable(period, page, pageSize);
  });

  safeHandle("get-report-csv", (_, period) => {
    return getReportCSV(period || "weekly");
  });

  // Activity
  safeHandle("get-activity-sessions", (_, dateStr) => {
    return getActivitySessions(dateStr || null);
  });

  // AI
  safeHandle("get-ai-insights", () => {
    return generateProductivityInsights();
  });

  logger.info("Main", "All IPC handlers registered");

  createWindow();
  startTracking();
  syncTrackerLists();

  // Health check every 60 seconds
  setInterval(() => {
    try {
      const usage = getTodayUsage();
      const count = db
        .prepare("SELECT COUNT(*) AS c FROM app_usage")
        .get();

      logger.info(
        "Health",
        `${usage.length} apps today | ${count.c} total records`
      );
    } catch (err) {
      logger.warn("Health", "Check failed", err.message);
    }
  }, 60000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  logger.info("Main", "All windows closed");

  if (process.platform !== "darwin") {
    app.quit();
  }
});
