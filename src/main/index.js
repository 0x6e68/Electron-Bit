import {app, BrowserWindow} from 'electron';
import TorrentClient from './torrent-client';
import MetainfoLoader from './metainfo-loader';
import ClipboardTextListener from './clipboard-text-listener';

const magnet = require('magnet-uri');
const torrentClient = new TorrentClient();
const metainfoLoader = new MetainfoLoader();
const clipboardTextListener = new ClipboardTextListener();

const ipcMain = require('electron').ipcMain;

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  clipboardTextListener.addClipboardFunction({
    startsWith: 'magnet:',
    execute: (magnetLink) => {
      const parsedMagnetLink = magnet.decode(magnetLink);
      mainWindow.webContents.send('magnet-link-detected', parsedMagnetLink);
      metainfoLoader.loadFromInfoHash(parsedMagnetLink.infoHash).then((metadata) => {
        mainWindow.webContents.send('torrent-loaded', {
          name: metadata.name,
          infoHash: metadata.infoHash,
          magnetLink: magnetLink,
          totalSize: metadata.length,
          defaultDownloadPath: torrentClient.buildDefaultTemporaryPath(metadata.infoHash)
        });
      });
    }
  });

  ipcMain.on('beginn-download', (event, torrentId) => {
    torrentClient.download(torrentId,
      (downloadInfo) => {
        mainWindow.webContents.send('download-info', downloadInfo);
      },
      (torrentInfoHash) => {
        mainWindow.webContents.send('download-done', torrentInfoHash);
      });
  });

  ipcMain.on('pause-download', (event, infoHash) => {
    torrentClient.pauseTorrent(infoHash);
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
