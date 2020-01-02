const WebTorrent = require('webtorrent');
let clients = [];

const CustomFSChunkStore = require('./storage/custom-fs-chunk-store.js');

function createClient (infoHash) {
  const client = new WebTorrent();
  client.on('error', (err) => {
    console.log(err);
  });
  client.infoHash = infoHash;
  clients.push(client);

  console.log('client created', infoHash);

  return client;
}

function destroyClient (infoHash) {
  let client = clients.find((client) => client.infoHash === infoHash);
  if (client) {
    console.log('client destroy', infoHash);

    client.destroy((err) => {
      if (err) {
        console.log(err);
      }
      clients = clients.filter((client) => client.infoHash !== infoHash);
      console.log('client destroyed', infoHash);
    });
  }
}

export default class TorrentClient {
  buildDefaultTemporaryPath (infohash) {
    return require('path').join(CustomFSChunkStore.getDefaultTemporaryPath(), 'webtorrent', infohash);
  };

  pauseTorrent (infohash) {
    destroyClient(infohash);
  }

  download (downloadInfo, downloadCallback, uploadCallback, doneCallback) {
    let client = createClient(downloadInfo.infoHash);

    console.log('download magnet link:', downloadInfo.magnetLink);
    console.log('download path', downloadInfo.downloadPath);
    let torrent = client.add(downloadInfo.torrentBuffer, {
      path: downloadInfo.downloadPath,
      store: (chunkLength, storeOpts) => {
        return new CustomFSChunkStore(chunkLength, {files: storeOpts.files});
      }
    });
    torrent.on('error', (err) => {
      console.log(err);
    });
    torrent.on('warning', (err) => {
      console.log(err);
    });
    torrent.on('ready', () => {
      console.log('ready', torrent.infoHash);
    });
    torrent.on('infoHash', () => {
      console.log('infoHash', torrent.infoHash);
    });
    torrent.on('metadata', () => {
      console.log('metadata', torrent.infoHash);
    });
    torrent.on('download', (bytes) => {
      downloadCallback({
        infoHash: torrent.infoHash,
        totalDownloaded: torrent.downloaded,
        torrentSize: torrent.length,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        progress: torrent.progress
      });
    });
    torrent.on('upload', (bytes) => {
      uploadCallback({
        infoHash: torrent.infoHash,
        uploadSpeed: torrent.uploadSpeed
      });
    });
    torrent.on('done', () => {
      doneCallback(torrent.infoHash);
    });
  }
}
