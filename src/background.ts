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
let win: BrowserWindow | null;

const torrentClient = new TorrentClient();
const clipboardTextListener = new ClipboardTextListener();
const metadataLoader = new MetadataLoader();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function loadFromTorrentIdentifier (torrentIdentifier: TorrentIdentifier) {
  metadataLoader.loadFromTorrentIdentifier(torrentIdentifier).then((metadata) => {
    if (win) {
      metadata.defaultDownloadPath = torrentClient.buildDefaultTemporaryPath(metadata.infoHash);
      sendToMainWindow('torrent-loaded', metadata);
    }
  });
}

function sendToMainWindow (channel: string, ...args: any[]) {
  if (win) {
    win.webContents.send(channel, args);
  }
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
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
              fs.readFile(torrentFilePath[0], function (err, data) {
                if (err) {
                  throw err;
                }
                loadFromTorrentIdentifier(data);
              });
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
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
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
  if (win === null) {
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

  clipboardTextListener.addClipboardFunction({
    startsWith: 'magnet:',
    execute: (magnetLinkText) => {
      const parsedMagnetLink: any = Magnet.decode(magnetLinkText);
      sendToMainWindow('magnet-link-detected', parsedMagnetLink);
      loadFromTorrentIdentifier(parsedMagnetLink.infoHash);
    }
  });

  torrentClient.on('download', (downloadInfo: DownloadInfo) => {
    sendToMainWindow('download-info', downloadInfo);
  });

  torrentClient.on('upload', (uploadInfo: UploadInfo) => {
    sendToMainWindow('upload-info', uploadInfo);
  });

  torrentClient.on('done', (infoHash: string) => {
    sendToMainWindow('download-done', infoHash);
  });

  ipcMain.on('beginn-download', (event:any, torrentDownload: TorrentDownload) => {
    torrentClient.download(torrentDownload);
  });

  ipcMain.on('pause-download', (event:any, infoHash: string) => {
    torrentClient.pauseTorrent(infoHash);
  });

  ipcMain.on('remove-torrent', (event:any, infoHash: string) => {
    torrentClient.pauseTorrent(infoHash);
    sendToMainWindow('torrent-removed', infoHash);
  });

  ipcMain.on('open-folder', (event:any, path:string) => {
    shell.showItemInFolder(path);
  });
});

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
