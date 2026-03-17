import db from "../db/database.js";

export function isBlocked(appName){

    const result = db.prepare(`
        SELECT * FROM blocked_apps
        WHERE app_name = ?

        `).get(appName);

    return !! result;
}
