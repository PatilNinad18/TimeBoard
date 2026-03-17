import db from "../db/database.js";

export function cleanupOldData() {
    db.prepare(`
        DELETE FROM app_usage
        WHERE timestamp < date('now', '-90 days');
        `).run();

    console.log("Old data cleaned");
}
