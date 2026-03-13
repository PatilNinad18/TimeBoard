import db from "../db/database.js";

export function getTodayUsage(){
    const today = new Date().toISOString().split("T")[0];

    const query = `
    SELECT app_name, COALESCE(SUM(duration),0) as total_time
    FROM app_usage
    WHERE DATE(timestamp) = ?
    GROUP BY app_name
    ORDER BY total_time DESC
    `;

    const rows = db.prepare(query).all(today);

    return rows.map(row => ({
        app: row.app_name,
        seconds: row.total_time
    }));
}