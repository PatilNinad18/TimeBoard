import { contextBridge, ipcRenderer } from "electron";
import { getProductiveApps, setProductiveApps } from "./services/productivityService.js";

contextBridge.exposeInMainWorld("statsAPI", {

  today: () => ipcRenderer.invoke("stats:today"),

  topApps: () => ipcRenderer.invoke("stats:top-apps"),

  productivity: () => ipcRenderer.invoke("stats:productivity")

});

contextBridge.executeInMainWorld("api", {

  setProductiveApps: (apps) => 
    ipcRenderer.invoke("set-productive-apps", apps),

  getProductiveApps: ()=>
    ipcRenderer.invoke("get-productive-apps")
})