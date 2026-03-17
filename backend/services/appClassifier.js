import { isProductiveApp } from "./productivityService.js";

export function classifyApp(appName, domain){

    if(isProductiveApp(appName)){
        return 1;
    }

    if(domain) {
        const productiveDomains = ["leetcode", "github", "stackoverflow"];

        if(productiveDomains.some(d => domain.toLowerCase().include(d))){
            return 1;
        }
    }

    // Everthing else  = distracting

    return 0;

}