export function extractDomain(appName, windowTitle){

    if(appName === "Google Chrome" || appName == "Microsoft Edge" || appName == "Brave"){

        const parts = windowTitle.split(" - ");

        if(parts.length > 1){
            return parts[parts.length -1];
        }
    }
    return null;
}