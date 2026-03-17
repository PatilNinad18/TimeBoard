import idle from "desktop-idle";

const IDLE_LIMIT = 60;

export function isUserIdle() {
    const idleTime = idle.getIdleTime();
    return idleTime > IDLE_LIMIT;
}