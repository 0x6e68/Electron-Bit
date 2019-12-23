import {app, BrowserWindow} from 'electron';
import TorrentClipboardListener from './torrent-clipboard-listener';

const WebTorrent = require('webtorrent');
const ipcMain = require('electron').ipcMain;

const client = new WebTorrent();

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

  // let torrent = client.add('magnet:?xt=urn:btih:1a17df934566f21b12489987f070671223b23a9d&dn=Kali+Linux+64+Bit+2018.4+-+3GB-ISO&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.ccc.de%3A80');
  // torrent.on('download', function (bytes) {
  //   console.log('just downloaded: ' + bytes);
  //   console.log('total downloaded: ' + torrent.downloaded);
  //   console.log('download speed: ' + torrent.downloadSpeed);
  //   console.log('progress: ' + torrent.progress);
  // });
  // torrent.resume();

  let torrentClipboardListener = new TorrentClipboardListener();
  torrentClipboardListener.addListener(200,
    (magnetLink) => mainWindow.webContents.send('magnet-link-detected', magnetLink),
    (torrent) => mainWindow.webContents.send('torrent-loaded', torrent));

  client.on('error', function (err) {
    console.log(err);
  });

  ipcMain.on('beginn-download', (event, downloadInfo) => {
    console.log('download magnet link:', downloadInfo.magnetLink);
    console.log('path:', downloadInfo.downloadPath);

    // let torrent = client.add(downloadInfo.infoHash);
    let torrent = client.add(downloadInfo.infoHash, {path: downloadInfo.downloadPath});
    client.on('torrent', function (torrent) {
      console.log('torrent ready');
    });
    torrent.pause();
    torrent.resume();
    // client.add(downloadInfo.infoHash, {path: downloadInfo.downloadPath}, (torrent) => {
    // client.add(downloadInfo.magnetLink, function (torrent) {
    torrent.on('download', function (bytes) {
      console.log('torrents', client.torrents.length);
      console.log('just downloaded: ' + bytes);
      console.log('total downloaded: ' + torrent.downloaded);
      console.log('download speed: ' + torrent.downloadSpeed);
      console.log('progress: ' + torrent.progress);
    });
    //
    torrent.on('done', function () {
      // torrent.rescanFiles((err) => console.log(err));

      console.log('torrent finished downloading');
      torrent.files.forEach(function (file) {
        console.log('path', file.path);
        console.log('file', file);
        file.getBuffer(function (err, buffer) {
          if (err) console.log(err);
          console.log(buffer); // <Buffer 00 98 00 01 ...>
        });
        // file.getBuffer();
      });
      // torrent.destroy((err) => console.log(err));
    });
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
