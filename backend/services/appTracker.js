import activeWindow from "active-win";
import db from "../db/database.js";
import { extractDomain, detectKnownApp, isKnownAppName, coreTitle } from "./domainExtractor.js";
import { isUserIdle } from "./idleService.js";

let currentSession = null;
let startTime      = null;

function normalizeAppName(appName) {
  if (appName === "Electron") {
    return "TimeBoard";
  }

  return appName;
}

// In-memory lists — updated from main.js whenever the user saves settings.
// Both are explicit, user-managed lists (blocked_apps / user_productive_apps).
// classifyApp() checks them directly — no guessing about "everything else".
let distractingAppNames = [];
let productiveAppNames  = [];

export function updateDistractingApps(apps) {
  distractingAppNames = (apps || []).map((a) => a.toLowerCase());
  console.log("[Tracker] Distracting apps list updated:", distractingAppNames);
}

export function updateProductiveApps(apps) {
  productiveAppNames = (apps || []).map((a) => a.toLowerCase());
  console.log("[Tracker] Productive apps list updated:", productiveAppNames);
}

export function resetTrackerSession() {
  currentSession = null;
  startTime = Date.now();
  console.log("[Tracker] Session reset after data deletion");
}

// Returns local ISO string like "2026-04-18T17:08:32"
function localISOString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear()     + "-" +
    pad(date.getMonth()+1) + "-" +
    pad(date.getDate())    + "T" +
    pad(date.getHours())   + ":" +
    pad(date.getMinutes()) + ":" +
    pad(date.getSeconds())
  );
}

function localDateString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear()     + "-" +
    pad(date.getMonth()+1) + "-" +
    pad(date.getDate())
  );
}

function insertUsageRow(appName, windowTitle, domain, durationSeconds, isProductive, isIdle, timestamp) {
  if (durationSeconds < 1) return;
  db.prepare(`
    INSERT INTO app_usage
      (app_name, window_title, domain, duration, is_productive, is_idle, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(appName, windowTitle, domain, durationSeconds, isProductive, isIdle ? 1 : 0, timestamp);
}

function startOfNextDay(date) {
  const d = new Date(date);
  d.setHours(24, 0, 0, 0);
  return d;
}

// Sessions can stay open across midnight (a tab with a title that never
// changes, an idle stretch overnight, etc.). This runs on every tick and,
// the moment it notices the running session's startTime is on a different
// calendar day than "now", closes out the portion that happened yesterday
// and rolls the session forward so it continues today. Ticks happen every
// second, so a multi-day gap (e.g. the laptop was asleep) just catches up
// one day per tick over the next couple of seconds after waking.
function splitOngoingSessionAtMidnight(now) {
  if (!currentSession || startTime == null) return;

  const startDate = new Date(startTime);
  if (localDateString(startDate) === localDateString(now)) return;

  const midnight = startOfNextDay(startDate);
  const beforeMidnightSeconds = Math.floor((midnight.getTime() - startDate.getTime()) / 1000);
  const afterMidnightSeconds  = Math.max(0, (Date.now() - midnight.getTime()) / 1000);

  // currentSession.domain is only ever set for idle sessions today — active
  // sessions don't get one until they're closed. Fall back to computing it
  // here so the "yesterday" row doesn't lose site info (e.g. "YouTube").
  const domain = currentSession.isIdle
    ? (currentSession.domain ?? null)
    : (currentSession.domain ?? extractDomain(currentSession.name, currentSession.title));

  const isProductive = currentSession.isIdle ? 0 : classifyApp(currentSession.name);

  insertUsageRow(
    currentSession.name,
    currentSession.title,
    domain,
    beforeMidnightSeconds,
    isProductive,
    currentSession.isIdle,
    localISOString(startDate)
  );

  // Keep tracking the same session, just rolled forward onto the new day —
  // and remember the domain we just computed so it isn't lost when this
  // session eventually closes for real.
  currentSession = { ...currentSession, domain };
  startTime = midnight.getTime();

  console.log(
    `[Tracker] Split ongoing session at midnight: ${currentSession.name} | ` +
    `${beforeMidnightSeconds}s before midnight, ~${afterMidnightSeconds.toFixed(0)}s after so far`
  );
}

// Classify app — single source of truth, consulted only here:
// 1. Explicit "Distracting" list (Settings) wins first.
// 2. Explicit "Productive" list (Settings) next.
// 3. Nothing configured either way → default Productive, so focus score
//    works day one without manual setup.
// The is_productive value written here is trusted as-is everywhere else
// (Dashboard/Analytics/Reports) — nothing re-derives it at read time.
function classifyApp(appName) {
  const normalizedAppName = normalizeAppName(appName);
  const lower = normalizedAppName.toLowerCase();

  if (distractingAppNames.includes(lower)) return 0;
  if (productiveAppNames.includes(lower))  return 1;

  return 1;
}

// Safety net: if for any reason a session's duration still spans two
// calendar days by the time it's saved (e.g. a tick was missed), split it
// here too. Under normal operation splitOngoingSessionAtMidnight() already
// rolls the session forward every tick, so this should rarely fire — but
// it's cheap insurance against losing/misdating time if a tick is skipped.
function saveSession(appName, windowTitle, domain, durationSeconds, isProductive, isIdle) {
  if (durationSeconds < 1) return; // skip sub-second sessions

  const sessionStart = new Date(Date.now() - durationSeconds * 1000);
  const sessionEnd    = new Date();

  if (localDateString(sessionStart) !== localDateString(sessionEnd)) {
    const midnight = startOfNextDay(sessionStart);
    const beforeMidnightSeconds = Math.floor((midnight.getTime() - sessionStart.getTime()) / 1000);
    const afterMidnightSeconds  = Math.max(0, durationSeconds - beforeMidnightSeconds);

    insertUsageRow(appName, windowTitle, domain, beforeMidnightSeconds, isProductive, isIdle, localISOString(sessionStart));
    insertUsageRow(appName, windowTitle, domain, afterMidnightSeconds,  isProductive, isIdle, localISOString(midnight));

    console.log(
      `[Tracker] Split session across midnight: ${appName} | ` +
      `${beforeMidnightSeconds}s before midnight + ${afterMidnightSeconds}s after midnight`
    );
    return;
  }

  const timestamp = localISOString(sessionStart);
  insertUsageRow(appName, windowTitle, domain, durationSeconds, isProductive, isIdle, timestamp);

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
    splitOngoingSessionAtMidnight(new Date());
    const idle = isUserIdle();

    if (idle) {
      if (currentSession && !currentSession.isIdle) {
        // Close the active session before recording idle time.
        const duration      = Number(((Date.now() - startTime) / 1000).toFixed(2));
        const prevDomain    = currentSession.domain ?? extractDomain(currentSession.name, currentSession.title);
        const productivity  = classifyApp(currentSession.name);

        saveSession(
          currentSession.name,
          currentSession.title,
          prevDomain,
          duration,
          productivity,
          false
        );

        // Keep the idle session attributed to the previous app so activity shows total app time.
        currentSession = {
          name: currentSession.name,
          title: currentSession.title,
          domain: prevDomain,
          isIdle: true,
        };
        startTime = Date.now();
        return;
      }

      if (!currentSession || !currentSession.isIdle) {
        currentSession = { name: "Idle", title: "Idle", domain: null, isIdle: true };
        startTime      = Date.now();
      }
      return;
    }

    const win = await activeWindow();
    if (!win) return;

    const rawAppName  = normalizeAppName(win.owner.name);
    const windowTitle = win.title || "";
    const knownApp    = detectKnownApp(rawAppName, windowTitle);

    let appName;
    if (knownApp) {
      appName = knownApp;
    } else if (
      currentSession &&
      isKnownAppName(currentSession.name) &&
      coreTitle(windowTitle) === coreTitle(currentSession.title)
    ) {
      // Same tab (title's core text matches), but this particular poll's
      // title happened to be missing its site suffix — keep the existing
      // classification instead of flip-flopping back to "Google Chrome".
      appName = currentSession.name;
    } else {
      appName = rawAppName;
    }

    if (currentSession && currentSession.isIdle) {
      const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));
      saveSession(
        currentSession.name,
        currentSession.title,
        currentSession.domain ?? null,
        duration,
        0,
        true
      );
      currentSession = null;
      startTime      = null;
    }

    // First detection — start tracking, nothing to save yet
    if (!currentSession) {
      currentSession = { name: appName, title: windowTitle, domain: null, isIdle: false };
      startTime      = Date.now();
      return;
    }

    // App changed, or it's genuinely a different tab/page — save the
    // previous session and start a new one. Comparing on coreTitle (rather
    // than the raw title) means a momentary suffix glitch on the SAME tab
    // no longer counts as a switch, so one continuous video watch stays
    // one continuous session instead of fragmenting into dozens of rows.
    if (currentSession.name !== appName || coreTitle(currentSession.title) !== coreTitle(windowTitle)) {
      const duration      = Number(((Date.now() - startTime) / 1000).toFixed(2));
      const prevDomain    = currentSession.domain ?? extractDomain(currentSession.name, currentSession.title);
      const productivity  = classifyApp(currentSession.name);

      saveSession(
        currentSession.name,
        currentSession.title,
        prevDomain,
        duration,
        productivity,
        false
      );

      currentSession = { name: appName, title: windowTitle, domain: null, isIdle: false };
      startTime      = Date.now();
    }

  } catch (error) {
    console.error("[Tracker] Error:", error.message);
  }
}

function startTracking() {
  // Load both explicit lists from DB on startup so existing settings apply immediately
  try {
    const blocked = db.prepare("SELECT app_name FROM blocked_apps").all();
    distractingAppNames = blocked.map((r) => r.app_name.toLowerCase());

    const productive = db.prepare("SELECT app_name FROM user_productive_apps").all();
    productiveAppNames = productive.map((r) => r.app_name.toLowerCase());

    console.log(`[Tracker] Loaded ${distractingAppNames.length} distracting, ${productiveAppNames.length} productive apps from DB`);
  } catch (err) {
    console.error("[Tracker] Failed to load app lists:", err.message);
  }

  console.log("[Tracker] Tracking started — polling every 1s");
  setInterval(trackActiveApp, 1000);
}

export default startTracking;