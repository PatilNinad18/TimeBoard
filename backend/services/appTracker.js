import activeWindow from "active-win";
import db from "../db/database.js";

import { classifyApp } from "./appClassifier.js";
import { isUserIdle } from "./idleDetector.js";
import { extractDomain } from "./domainExtractor.js";
import { isBlocked } from "./blockChecker.js";

let currentApp = null;
let startTime = null;

async function trackActiveApp() {
    try {

        if (isUserIdle()) {
            return;
        }

        const window = await activeWindow();
        if (!window) return;

        const appName = window.owner.name;
        const windowTitle = window.title;

        const domain = extractDomain(appName, windowTitle);
        const productivity = classifyApp(appName, windowTitle, domain);

        if (isBlocked(appName)) {
            console.log("Blocked app detected:", appName);
        }

        if (!currentApp) {
            currentApp = {
                name: appName,
                title: windowTitle
            };

            startTime = Date.now();
            return;
        }

        if (
            currentApp.name !== appName ||
            currentApp.title !== windowTitle
        ) {

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            db.prepare(`
                INSERT INTO app_usage
                (app_name, window_title, duration, is_productive)
                VALUES (?, ?, ?, ?)
            `).run(
                currentApp.name,
                currentApp.title,
                duration,
                productivity
            );

            console.log(`Saved : ${currentApp.name} - ${duration}s`);

            currentApp = {
                name: appName,
                title: windowTitle
            };

            startTime = Date.now();
        }

    } catch (error) {
        console.error("Tracking error:", error);
    }
}

function startTracking() {
    console.log("App tracking started...");
    setInterval(trackActiveApp, 1000);
}

export default startTracking;