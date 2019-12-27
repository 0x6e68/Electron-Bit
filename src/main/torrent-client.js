import MetainfoLoader from './metainfo-loader';

const {clipboard} = require('electron');
const magnet = require('magnet-uri');
const WebTorrent = require('webtorrent');
const client = new WebTorrent();
const FSChunkStore = require('./storage/custom-fs-chung-store.js');
// const fx = require('mkdir-recursive');
// const path = require('path');
const options = {
  store: (chunkLength, storeOpts) => {
    console.log(chunkLength, storeOpts);
    let fileArray = storeOpts.files.map(file => {
      return {
        path: file.path,
        length: file.length
      };
    });
    console.log('files', {files: fileArray});
    // for (let file of fileArray) {
    //   fx.mkdir(path.dirname(file.path), function (err) {
    //     console.log(err);
    //   });
    // }
    let fsChunkStore = new FSChunkStore(chunkLength, {files: fileArray});
    return fsChunkStore;
  }
};

export default class TorrentClient {
  download (webContents, downloadInfo) {
    console.log('download magnet link:', downloadInfo.magnetLink);

    let torrent = client.add(downloadInfo.infoHash, options);
    torrent.on('download', function (bytes) {
      console.log('just downloaded: ' + bytes);
      console.log('total downloaded: ' + torrent.downloaded);
      console.log('download speed: ' + torrent.downloadSpeed);
      console.log('progress: ' + torrent.progress);
    });
    torrent.on('done', function () {
      console.log('done...');
    });
  }

  addListener (timeout, magnetlinkDetectedCallback, loadedTorrentCallback) {
    let contentCache;

    setInterval(() => {
      let content = clipboard.readText();

      if (content !== contentCache) {
        contentCache = content;

        if (content.startsWith('magnet:')) {
          const parsed = magnet.decode(content);

          magnetlinkDetectedCallback({
            name: parsed.name,
            infoHash: parsed.infoHash
          });

          let metainfoLoader = new MetainfoLoader();
          let metainfoLoaderPromise = metainfoLoader.loadFromInfoHash(parsed.infoHash);

          metainfoLoaderPromise.then((metadata) => {
            loadedTorrentCallback({
              name: metadata.name,
              infoHash: metadata.infoHash,
              magnetLink: content,
              totalSize: metadata.length,
              files: []
            });
          });
        }
      }
    }, timeout);
  }
}
