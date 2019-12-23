'use strict';

import {app, BrowserWindow} from 'electron';
import TorrentClipboardListener from './torrent-clipboard-listener';

const WebTorrent = require('webtorrent');
const ipcMain = require('electron').ipcMain;

const client = new WebTorrent({dht: false});

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

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
    client.destroy();
  });

  let torrentClipboardListener = new TorrentClipboardListener();
  torrentClipboardListener.addListener(200,
    (magnetLink) => mainWindow.webContents.send('magnet-link-detected', magnetLink),
    (torrent) => mainWindow.webContents.send('torrent-loaded', torrent));

  ipcMain.on('beginn-download', (event, downloadInfo) => {
    console.log('download magnet link:', downloadInfo.magnetLink);
    let torrent = client.add(downloadInfo.magnetLink);
    // let torrent = client.add(downloadInfo.infoHash, {path: downloadInfo.downloadPath});
    // torrent.pause();
    // torrent.resume();
    // client.add(downloadInfo.infoHash, {path: downloadInfo.downloadPath}, (torrent) => {
    // client.add(downloadInfo.magnetLink, function (torrent) {
    torrent.on('download', function (bytes) {
      console.log('just downloaded: ' + bytes);
      console.log('total downloaded: ' + torrent.downloaded);
      console.log('download speed: ' + torrent.downloadSpeed);
      console.log('progress: ' + torrent.progress);
    });
    //
    // torrent.on('done', function () {
    //   console.log('torrent finished downloading');
    //   // torrent.rescanFiles();
    //   // torrent.files.forEach(function (file) {
    //   //   file.getBuffer(function (err, buffer) {
    //   //     if (err) {
    //   //       console.log('err', err);
    //   //       throw err;
    //   //     }
    //   //     console.log('write', file.path);
    //   //     fs.writeFile(file.path, buffer);
    //   //   });
    //   // });
    // });
    // });
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
