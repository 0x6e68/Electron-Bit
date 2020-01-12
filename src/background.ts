'use strict';

import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, shell } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import TorrentClient, { DownloadInfo, TorrentDownload, UploadInfo } from '@/lib/torrent-client';
import ClipboardTextListener from '@/lib/clipboard-text-listener';
import MetadataLoader, { TorrentIdentifier } from '@/lib/metadata-loader';
import * as Magnet from 'magnet-uri';
import * as fs from 'fs';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;

const torrentClient = new TorrentClient();
const clipboardTextListener = new ClipboardTextListener();
const metadataLoader = new MetadataLoader();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  let menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Load Torrent File',
          click () {
            const torrentFilePath = dialog.showOpenDialog({
              filters: [{ name: 'Torrents', extensions: ['torrent'] }],
              properties: ['openFile']
            });

            if (torrentFilePath && torrentFilePath.length === 1) {
              // TODO: fs.readFile and load torrent
            }
          }
        },
        {
          label: 'Exit',
          click () {
            app.quit();
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();

  // TODO features
  // -> clipboard: 'magnet-link-detected' ( Magnet.decode -> name, infoHash)
  // -> broadcast download informations: get 'download' (DownloadInfo) send 'download-info'
  // -> broadcast upload informations: get 'upload' (UploadInfo) send 'upload-info'
  // -> broadcast download done: get 'done' send 'download-done'
  // -> beginn new download: get 'beginn-download' and beginn download
  // -> pause download: get 'pause-download' and stop download
  // -> remove download: get 'remove-torrent', remove download and send 'torrent-removed'
  // -> open folder: get 'open-folder' and open location via 'shell.showItemInFolder'
});

function loadFromTorrentIdentifier (torrentIdentifier: TorrentIdentifier) {
  metadataLoader.loadFromTorrentIdentifier(torrentIdentifier).then((metadata) => {
    metadata.defaultDownloadPath = torrentClient.buildDefaultTemporaryPath(metadata.infoHash);
    // TODO: send 'torrent-loaded' with metadata
  });
}

function sendToMainWindow (channel: string, arg: any) {
  if (mainWindow) {
    mainWindow.webContents.send(channel, arg);
  }
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
