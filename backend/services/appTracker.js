import activeWindow from "active-win";
import db from "../db/database.js";
// import { func } from "joi";

let currentApp = null;
let startTime = null;

async function trackActiveApp() {
    try {
        const window = await activeWindow();

        if(!window) return;

        const appName = window.owner.name;
        const windowTitle = window.title;

        // first time initialization
        if(!currentApp){
            currentApp = {
                name: appName,
                title : windowTitle

            };
            startTime = Date.now();
            return ;

        }

        // detect app change
        if(currentApp.name !== appName || currentApp.title !== windowTitle){
            const endTime = Date.now();
            const duration = Math.floor((endTime - startTime)) / 1000;

            // save previous session

            db.prepare(`
                INSERT INTO app_usage (app_name, window_title, duration)
                VALUES (?,?,?)
                `).run(currentApp.name, currentApp.title, duration);

            console.log(`Saved : ${currentApp.name} - ${duration}s`);

            // start new session
            currentApp = {
                name : appName,
                title : windowTitle
            };

            startTime = Date.now();
            
        }


    } catch (error) {
        console.error("Tracking error : ", error)
    }
    
}

function startTracking(){
    console.log("App tracking started...");

    setInterval(trackActiveApp, 1000)
    
}

export default startTracking;