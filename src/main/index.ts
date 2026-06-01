import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { initDatabase, pingDatabase, resolveDatabasePath } from './db';
import { registerProjectsIpc } from './ipc/projects';
import { registerTasksIpc } from './ipc/tasks';

const APP_BACKGROUND = '#09090b';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: APP_BACKGROUND,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  const db = initDatabase(resolveDatabasePath());
  if (!pingDatabase(db)) {
    throw new Error('Database connection check failed');
  }

  registerProjectsIpc();
  registerTasksIpc();
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
