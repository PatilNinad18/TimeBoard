import { ipcMain } from "electron";
import { setProductiveApps, getProductiveApps } from "../services/productivityService.js";

ipcMain.handle("set-productive-apps", (_, apps) => {
    setProductiveApps(apps);
});

ipcMain.handle("get-productive-apps", () => {
    return getProductiveApps();
});