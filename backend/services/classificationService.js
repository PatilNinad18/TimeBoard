/**
 * classificationService.js
 *
 * Single source of truth for app-classification logic.
 *
 * Architecture:
 *   user_productive_apps  — explicit "productive" list saved in Settings
 *   blocked_apps          — explicit "distracting" list saved in Settings
 *
 * Priority (matches appTracker.classifyApp):
 *   1. blocked_apps wins  → distracting (0)
 *   2. user_productive_apps → productive (1)
 *   3. unknown             → productive (1)  ← default
 */

import db from "../db/database.js";

// ── SQL fragments ─────────────────────────────────────────────────────────────

/**
 * Returns two LEFT JOIN clauses that attach current classification tables
 * to any query on app_usage (aliased as `a`).
 */
export function classifyJoins() {
  return `
    LEFT JOIN blocked_apps       ba ON lower(ba.app_name) = lower(a.app_name)
    LEFT JOIN user_productive_apps pa ON lower(pa.app_name) = lower(a.app_name)
  `;
}

/**
 * SQL CASE expression that resolves the CURRENT classification of an app,
 * overriding whatever is_productive value was baked into the row at
 * recording time.
 */
export function effectiveProductiveExpr() {
  return `
    CASE
      WHEN ba.app_name IS NOT NULL THEN 0
      WHEN pa.app_name IS NOT NULL THEN 1
      ELSE 1
    END
  `;
}

// ── In-process helpers ────────────────────────────────────────────────────────

export function getProductiveSet() {
  try {
    return new Set(
      db.prepare("SELECT app_name FROM user_productive_apps").all()
        .map(r => r.app_name.toLowerCase())
    );
  } catch {
    return new Set();
  }
}

export function getDistractingSet() {
  try {
    return new Set(
      db.prepare("SELECT app_name FROM blocked_apps").all()
        .map(r => r.app_name.toLowerCase())
    );
  } catch {
    return new Set();
  }
}

/**
 * Synchronous classification.
 * Returns 1 (productive) or 0 (distracting).
 */
export function classifyAppName(appName) {
  const lower = (appName || "").toLowerCase();
  if (getDistractingSet().has(lower)) return 0;
  if (getProductiveSet().has(lower))  return 1;
  return 1; // default productive
}

/**
 * Set an individual app classification atomically.
 * @param {string} appName
 * @param {"Productive" | "Distracting" | "productive" | "distracting"} category
 */
export function setSingleAppClassification(appName, category) {
  if (!appName || typeof appName !== "string") return;
  const name = appName.trim();
  const isProd = category.toLowerCase() === "productive";

  const deleteProd = db.prepare(`DELETE FROM user_productive_apps WHERE lower(app_name) = lower(?)`);
  const deleteBlocked = db.prepare(`DELETE FROM blocked_apps WHERE lower(app_name) = lower(?)`);
  const insertProd = db.prepare(`INSERT OR IGNORE INTO user_productive_apps (app_name) VALUES (?)`);
  const insertBlocked = db.prepare(`INSERT OR IGNORE INTO blocked_apps (app_name) VALUES (?)`);

  const tx = db.transaction(() => {
    deleteProd.run(name);
    deleteBlocked.run(name);
    if (isProd) {
      insertProd.run(name);
    } else {
      insertBlocked.run(name);
    }
  });

  tx();
}
