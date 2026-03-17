import { ipcMain } from "electron";
import { getTodayProductivityStats } from "../services/statsService.js";

ipcMain.handle("get-productive-stats", () => {
    return getTodayProductivityStats();
    
})