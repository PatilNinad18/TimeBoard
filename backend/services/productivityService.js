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