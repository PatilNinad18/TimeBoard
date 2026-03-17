// import "./server.js"
import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { ipcMain } from "electron/main";
import { getTodayUsage } from "./services/dataAggregator.js";
import startTracking from "./services/appTracker.js";
import {
  getTodayStats,
  getTopApps,
  getProductivityStats
} from "./services/statsService.js";

ipcMain.handle("stats:today", () => {
  return getTodayStats();
});

ipcMain.handle("stats:top-apps", () => {
  return getTopApps();
});

ipcMain.handle("stats:productivity", () => {
  return getProductivityStats();
});

// recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    // Development: Vite server
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // Production build
    mainWindow.loadFile(
      path.join(__dirname, "../frontend/dist/index.html")
    );
  }
}

app.whenReady().then(() => {

  createWindow();

  // Start app usage tracking
  startTracking();

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


ipcMain.handle("get-usage", () => {
  return getTodayUsage();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});