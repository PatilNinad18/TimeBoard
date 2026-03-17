import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("statsAPI", {

  today: () => ipcRenderer.invoke("stats:today"),

  topApps: () => ipcRenderer.invoke("stats:top-apps"),

  productivity: () => ipcRenderer.invoke("stats:productivity")

});