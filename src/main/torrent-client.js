const WebTorrent = require('webtorrent');
const client = new WebTorrent();
client.on('error', (err) => {
  console.log(err);
});
const CustomFSChunkStore = require('./storage/custom-fs-chunk-store.js');

export default class TorrentClient {
  download (downloadInfo, downloadCallback, doneCallback) {
    console.log('download magnet link:', downloadInfo.magnetLink);
    let torrent = client.add(downloadInfo.infoHash, {
      store: (chunkLength, storeOpts) => {
        let fileArray = storeOpts.files.map(file => {
          return {
            path: file.path,
            length: file.length
          };
        });
        return new CustomFSChunkStore(chunkLength, {files: fileArray});
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
