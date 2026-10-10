import db from "../db/database.js";

export function setProductiveApps(apps) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO user_productive_apps (app_name)
    VALUES (?)
  `);
  const deleteAll = db.prepare(`DELETE FROM user_productive_apps`);
  const deleteFromBlocked = db.prepare(`DELETE FROM blocked_apps WHERE lower(app_name) = lower(?)`);

  const transaction = db.transaction((appList) => {
    deleteAll.run();
    for (const app of appList) {
      if (app && typeof app === "string" && app.trim()) {
        const trimmed = app.trim();
        insert.run(trimmed);
        deleteFromBlocked.run(trimmed);
      }
    }
  });

  transaction(apps || []);
}

// Get productive apps
export function getProductiveApps() {
  return db.prepare(`
    SELECT app_name FROM user_productive_apps
  `).all().map(row => row.app_name);
}

// Check if productive
export function isProductiveApp(appName) {
  if (!appName) return false;
  const result = db.prepare(`
    SELECT 1 FROM user_productive_apps
    WHERE lower(app_name) = lower(?)
  `).get(appName.trim());

  return !!result;
}