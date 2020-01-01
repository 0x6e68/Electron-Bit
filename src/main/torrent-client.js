const WebTorrent = require('webtorrent');
const client = new WebTorrent();
client.on('error', (err) => {
  console.log(err);
});
const CustomFSChunkStore = require('./storage/custom-fs-chunk-store.js');

export default class TorrentClient {
  download (downloadInfo, downloadCallback, doneCallback) {
    console.log('download magnet link:', downloadInfo.magnetLink);
    console.log('download path', downloadInfo.downloadPath);
    let torrent = client.add(downloadInfo.infoHash, {
      path: downloadInfo.downloadPath,
      store: (chunkLength, storeOpts) => {
        return new CustomFSChunkStore(chunkLength, {files: storeOpts.files});
      }
    });
    torrent.on('error', (err) => {
      console.log(err);
    });
    torrent.on('download', (bytes) => {
      downloadCallback({
        infoHash: torrent.infoHash,
        totalDownloaded: torrent.downloaded,
        torrentSize: torrent.length,
        downloadSpeed: torrent.downloadSpeed,
        progress: torrent.progress
      });
    });
    torrent.on('done', () => {
      doneCallback(torrent.infoHash);
    });
  }
}
