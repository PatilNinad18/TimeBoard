import db from "../db/database.js";

export function isBlocked(appName) {
  if (!appName) return false;
  const result = db.prepare(`
    SELECT 1 FROM blocked_apps
    WHERE lower(app_name) = lower(?)
  `).get(appName.trim());

  return !!result;
}

// Replace the Distracting (blocked) apps list in one go
export function setBlockedApps(apps) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO blocked_apps (app_name) VALUES (?)
  `);
  const deleteAll = db.prepare(`DELETE FROM blocked_apps`);
  const deleteFromProd = db.prepare(`DELETE FROM user_productive_apps WHERE lower(app_name) = lower(?)`);

  const transaction = db.transaction((appList) => {
    deleteAll.run();
    for (const app of appList) {
      if (app && typeof app === "string" && app.trim()) {
        const trimmed = app.trim();
        insert.run(trimmed);
        deleteFromProd.run(trimmed);
      }
    }
  });

  transaction(apps || []);
}

export function getBlockedApps() {
  return db.prepare(`SELECT app_name FROM blocked_apps`).all().map(r => r.app_name);
}