// Electron Main Process for "ورقة إلى إكسل ذكي - صادق الظاهري 2026"
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverProcess = null;

// Determine whether we are in dev mode or production
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 650,
    title: 'ورقة إلى إكسل ذكي - صادق الظاهري 2026',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#020617', // slate-950
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production build, load from local built files or embedded server
    const localHtmlPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(localHtmlPath).catch((err) => {
      console.log('Loading fallback local server:', err);
      mainWindow.loadURL('http://localhost:3000');
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
