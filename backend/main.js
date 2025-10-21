const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = !app.isPackaged; // true during development

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    // 🧑‍💻 Development: Load from Vite dev server
    win.loadURL("http://localhost:5173");
  } else {
    // 🏗️ Production: Load the built index.html file
    win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
