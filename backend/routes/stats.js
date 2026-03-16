import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get("/today", (req, res) => {
    const data = db.prepare(`
        SELECT app_name, SUM(duration) as total_seconds
        FROM app_usage
        WHERE date(timestamp) = date('now')
        GROUP BY app_name
        ORDER BY total_seconds DESC
    `).all();

    res.json(data);
});

router.get("/top-apps", (req, res) => {
    const data = db.prepare(`
        SELECT app_name, SUM(duration) as total_seconds
        FROM app_usage
        GROUP BY app_name
        ORDER BY total_seconds DESC
        LIMIT 10
    `).all();

    res.json(data);
});

router.get("/productivity", (req, res) => {
    const result = db.prepare(`
        SELECT
        SUM(CASE WHEN is_productive = 1 THEN duration ELSE 0 END) as productive,
        SUM(CASE WHEN is_productive = 0 THEN duration ELSE 0 END) as distracting
        FROM app_usage
        WHERE date(timestamp) = date('now')
    `).get();

    const score =
        result.productive /
        (result.productive + result.distracting) *
        100;

    res.json({
        productive: result.productive,
        distracting: result.distracting,
        score: score || 0
    });
});

export default router;