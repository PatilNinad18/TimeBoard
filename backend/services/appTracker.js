import activeWindow from "active-win";
import db from "../db/database.js";
import { extractDomain } from "./domainExtractor.js";
import { isBlocked } from "./blockChecker.js";
import { isUserIdle } from "./idleService.js";
import { loadProductivityRules, isProductiveApp } from "./productivityRules.js";

let currentSession = null;
let startTime      = null;

// In-memory list of distracting app names — updated from main.js when user saves settings
let distractingAppNames = [];

export function updateDistractingApps(apps) {
  distractingAppNames = (apps || []).map((a) => a.toLowerCase());
  console.log("[Tracker] Distracting apps list updated:", distractingAppNames);
}

// Returns local ISO string like "2026-04-18T17:08:32"
function localISOString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    now.getFullYear()     + "-" +
    pad(now.getMonth()+1) + "-" +
    pad(now.getDate())    + "T" +
    pad(now.getHours())   + ":" +
    pad(now.getMinutes()) + ":" +
    pad(now.getSeconds())
  );
}

// Classify app:
// 1. If user explicitly marked it as distracting → 0
// 2. If app is in blocked_apps table → 0
// 3. Everything else → 1 (productive by default)
//    This ensures focus score works from day one without manual config
function classifyApp(appName) {
  // Use the centralized productivity rules so classification is consistent
  try {
    const rules = loadProductivityRules();
    return isProductiveApp(appName, rules) ? 1 : 0;
  } catch (err) {
    // Fallback: respect in-memory list and blocked_apps table
    if (distractingAppNames.includes(String(appName || "").toLowerCase())) return 0;
    const blocked = db.prepare(
      "SELECT 1 FROM blocked_apps WHERE LOWER(app_name) = LOWER(?)"
    ).get(appName);
    if (blocked) return 0;
    return 1;
  }
}

function saveSession(appName, windowTitle, domain, durationSeconds, isProductive, isIdle) {
  if (durationSeconds < 1) return; // skip sub-second sessions

  const timestamp = localISOString();

  db.prepare(`
    INSERT INTO app_usage
      (app_name, window_title, domain, duration, is_productive, is_idle, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(appName, windowTitle, domain, durationSeconds, isProductive, isIdle ? 1 : 0, timestamp);

  console.log(
    `[Tracker] Saved: "${appName}" | ` +
    `${durationSeconds.toFixed(1)}s | ` +
    `productive:${isProductive} | ` +
    `idle:${isIdle ? 1 : 0} | ` +
    `${timestamp}`
  );
}

async function trackActiveApp() {
  try {
    const idle = isUserIdle();

    if (idle) {
      // Save current session as idle then reset
      if (currentSession) {
        const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));
        saveSession(currentSession.name, currentSession.title, null, duration, 0, true);
        currentSession = null;
        startTime      = null;
      }
      return;
    }

    const win = await activeWindow();
    if (!win) return;

    const appName     = win.owner.name;
    const windowTitle = win.title || "";
    const domain      = extractDomain(appName, windowTitle);

    // Skip blocked apps entirely — don't even record them
    // Also skip TimeBoard itself to prevent self-tracking
    if (isBlocked(appName) || appName === "TimeBoard") {
      console.log(`[Tracker] Blocked: ${appName}`);
      return;
    }

    // First detection — start tracking, nothing to save yet
    if (!currentSession) {
      currentSession = { name: appName, title: windowTitle };
      startTime      = Date.now();
      return;
    }

    // Only treat app *name* changes as a session boundary. Window title
    // often changes (especially in browsers) and would create many tiny
    // sessions that still sum to the same time — but they make the DB noisy
    // and can lead to confusing UI. Update title in-place instead.
    if (currentSession.name !== appName) {
      const duration    = Number(((Date.now() - startTime) / 1000).toFixed(2));
      const prevDomain  = extractDomain(currentSession.name, currentSession.title);
      const productivity = classifyApp(currentSession.name);

      saveSession(
        currentSession.name,
        currentSession.title,
        prevDomain,
        duration,
        productivity,
        false
      );

      currentSession = { name: appName, title: windowTitle };
      startTime      = Date.now();
    } else if (currentSession.title !== windowTitle) {
      // Same app — keep tracking, but refresh title for future domain extraction
      currentSession.title = windowTitle;
    }

  } catch (error) {
    console.error("[Tracker] Error:", error.message);
  }
}

function startTracking() {
  // Load distracting apps from DB on startup so existing settings apply immediately
  try {
    const blocked = db.prepare("SELECT app_name FROM blocked_apps").all();
    distractingAppNames = blocked.map((r) => r.app_name.toLowerCase());
    console.log(`[Tracker] Loaded ${distractingAppNames.length} blocked apps from DB`);
  } catch (err) {
    console.error("[Tracker] Failed to load blocked apps:", err.message);
  }

  console.log("[Tracker] Tracking started — polling every 1s");
  setInterval(trackActiveApp, 1000);
}

export default startTracking;