import activeWindow from "active-win";
import db from "../db/database.js";

import { classifyApp } from "./appClassifier.js";
import { extractDomain } from "./domainExtractor.js";
import { isBlocked } from "./blockChecker.js";
import { isUserIdle } from "./idleService.js";

let currentSession = null;
let startTime = null;
let wasIdle = false;
let idleStartTime = null;

async function trackActiveApp() {

  try {

    

    const window = await activeWindow();
    if (!window) return;

    const appName = window.owner.name;
    const windowTitle = window.title;

    const domain = extractDomain(appName, windowTitle);

    // 🔴 BLOCK CHECK
    if (isBlocked(appName)) {
      console.log("Blocked:", appName);
      return;
    }

    // FIRST SESSION
    if (!currentSession) {
      currentSession = { name: appName, title: windowTitle };
      startTime = Date.now();
      return;
    }

    // APP CHANGE
    if (
      currentSession.name !== appName ||
      currentSession.title !== windowTitle
    ) {

      const endTime = Date.now();
      const duration = Number(((endTime-startTime)/1000).toFixed(2));

      const prevDomain = extractDomain(
        currentSession.name,
        currentSession.title
      );

      const productivity = classifyApp(
        currentSession.name,
        prevDomain
      );

      db.prepare(`
        INSERT INTO app_usage
        (app_name, window_title, domain, duration, is_productive)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        currentSession.name,
        currentSession.title,
        prevDomain,
        duration,
        productivity
      );

      console.log(`Saved : ${currentSession.name} - ${duration}s`);

      // Start new session
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