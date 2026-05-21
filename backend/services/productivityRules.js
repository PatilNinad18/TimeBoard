import db from "../db/database.js";

export function loadProductivityRules() {
  const productiveApps = db.prepare(`
    SELECT LOWER(app_name) as name FROM user_productive_apps
  `).all().map(r => r.name);

  const blockedApps = db.prepare(`
    SELECT LOWER(app_name) as name FROM blocked_apps
  `).all().map(r => r.name);

  return {
    productiveApps,
    blockedApps,
    hasProductiveApps: productiveApps.length > 0,
  };
}

export function isProductiveApp(appName, rules) {
  const normalized = String(appName || "").toLowerCase();
  if (rules.blockedApps.includes(normalized)) return false;
  if (rules.hasProductiveApps) return rules.productiveApps.includes(normalized);
  return true;
}
