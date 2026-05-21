import db from "../db/database.js";

export function setProductiveApps(apps) {
    const insert = db.prepare(`
        INSERT OR IGNORE INTO user_productive_apps (app_name)
        VALUES (?)
        `);

    const deleteAll = db.prepare(`DELETE FROM user_productive_apps`);

    const transaction = db.transaction((appList) => {
        deleteAll.run();

        for(const app of appList){
            insert.run(app);
        }
    });

    transaction(apps);
}

// Get productive apps
export function getProductiveApps() {
    return db.prepare(`
        SELECT app_name FROM user_productive_apps
        `).all().map(row => row.app_name);
}

// Check if productive
export function isProductiveApp(appName){
    const result = db.prepare(`
        SELECT 1 FROM user_productive_apps
        WHERE app_name = ?
        `).get(appName);

        return !! result;
}

// Sync existing app_usage rows' is_productive flags to match current rules.
// By default updates last 7 days to avoid long-running operations.
export function syncIsProductiveFlags(days = 7) {
    const { productiveApps, blockedApps, hasProductiveApps } = loadProductivityRules();

    const rows = db.prepare(`
        SELECT id, app_name FROM app_usage
        WHERE timestamp >= date('now','localtime', ?)
    `).all(`-${days} days`);

    const update = db.prepare(`UPDATE app_usage SET is_productive = ? WHERE id = ?`);
    const tx = db.transaction((items) => {
        for (const r of items) {
            const name = String(r.app_name || "").toLowerCase();
            let expected = 1;
            if (blockedApps.includes(name)) expected = 0;
            else if (hasProductiveApps) expected = productiveApps.includes(name) ? 1 : 0;
            update.run(expected, r.id);
        }
    });

    tx(rows);
    return rows.length;
}