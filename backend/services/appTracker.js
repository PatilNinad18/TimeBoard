import activeWindow from "active-win";
import db from "../db/database.js";
import { classifyApp } from "./appClassifier.js";
import { extractDomain } from "./domainExtractor.js";
import { isBlocked } from "./blockChecker.js";
import { isUserIdle } from "./idleService.js";

let currentSession = null;
let startTime = null;

// Returns current local datetime as ISO string e.g. "2026-04-11T17:08:32.000"
// This is what gets stored in the DB — NOT UTC
function localISOString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    now.getFullYear() + "-" +
    pad(now.getMonth() + 1) + "-" +
    pad(now.getDate()) + "T" +
    pad(now.getHours()) + ":" +
    pad(now.getMinutes()) + ":" +
    pad(now.getSeconds())
  );
}

function saveSession(appName, windowTitle, domain, durationSeconds, isProductive, isIdle) {
  const timestamp = localISOString(); // always explicit local time
  db.prepare(`
    INSERT INTO app_usage
      (app_name, window_title, domain, duration, is_productive, is_idle, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(appName, windowTitle, domain, durationSeconds, isProductive, isIdle, timestamp);

  console.log(`Saved: ${appName} | ${durationSeconds.toFixed(1)}s | idle:${isIdle} | ${timestamp}`);
}

async function trackActiveApp() {
  try {
    const idle = isUserIdle();

    if (idle) {
      // Save whatever was running as an idle session then reset
      if (currentSession) {
        const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));
        saveSession(currentSession.name, currentSession.title, null, duration, 0, 1);
        currentSession = null;
        startTime = null;
      }
      return;
    }

    const win = await activeWindow();
    if (!win) return;

    const appName = win.owner.name;
    const windowTitle = win.title;
    const domain = extractDomain(appName, windowTitle);

    if (isBlocked(appName)) {
      console.log("Blocked:", appName);
      return;
    }

    // First ever detection — just start the session, nothing to save yet
    if (!currentSession) {
      currentSession = { name: appName, title: windowTitle };
      startTime = Date.now();
      return;
    }

    // App or window changed — save previous session, start new one
    if (currentSession.name !== appName || currentSession.title !== windowTitle) {
      const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));
      const prevDomain = extractDomain(currentSession.name, currentSession.title);
      const productivity = classifyApp(currentSession.name, prevDomain);

      saveSession(currentSession.name, currentSession.title, prevDomain, duration, productivity, 0);

      currentSession = { name: appName, title: windowTitle };
      startTime = Date.now();
    }

  } catch (error) {
    console.error("Tracking error:", error);
  }
}

function startTracking() {
  console.log("Tracking started...");
  setInterval(trackActiveApp, 1000);
}

export default startTracking;