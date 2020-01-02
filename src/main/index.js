import {app, BrowserWindow, dialog, ipcMain, Menu, shell} from 'electron';
import TorrentClient from './torrent-client';
import MetainfoLoader from './metainfo-loader';
import ClipboardTextListener from './clipboard-text-listener';
import * as Magnet from 'magnet-uri';

const torrentClient = new TorrentClient();
const metainfoLoader = new MetainfoLoader();
const clipboardTextListener = new ClipboardTextListener();
const fs = require('fs');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1000
  });

  mainWindow.loadURL(winURL);

  let menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Load Torrent File',
          click () {
            const torrentFilePath = dialog.showOpenDialog({
              filters: [{name: 'Torrents', extensions: ['torrent']}],
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  clipboardTextListener.addClipboardFunction({
    startsWith: 'magnet:',
    execute: (magnetLink) => {
      const parsedMagnetLink = Magnet.decode(magnetLink);
      mainWindow.webContents.send('magnet-link-detected', parsedMagnetLink);
      loadFromTorrentIdentifier(parsedMagnetLink.infoHash);
    }
  });

  ipcMain.on('beginn-download', (event, torrentId) => {
    torrentClient.download(torrentId,
      (downloadInfo) => {
        mainWindow.webContents.send('download-info', downloadInfo);
      },
      (uploadInfo) => {
        mainWindow.webContents.send('upload-info', uploadInfo);
      },
      (infoHash) => {
        mainWindow.webContents.send('download-done', infoHash);
      });
  });

  ipcMain.on('pause-download', (event, infoHash) => {
    torrentClient.pauseTorrent(infoHash);
  });

  ipcMain.on('remove-torrent', (event, infoHash) => {
    torrentClient.pauseTorrent(infoHash);
    mainWindow.webContents.send('torrent-removed', infoHash);
  });

  ipcMain.on('open-folder', (event, path) => {
    shell.showItemInFolder(path);
  });
}

function loadFromTorrentIdentifier (torrentIdentifier) {
  metainfoLoader.loadFromTorrentIdentifier(torrentIdentifier).then((metadata) => {
    metadata.defaultDownloadPath = torrentClient.buildDefaultTemporaryPath(metadata.infoHash);
    mainWindow.webContents.send('torrent-loaded', metadata);
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
