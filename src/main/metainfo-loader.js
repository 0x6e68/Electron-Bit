const WebTorrent = require('webtorrent');

export default class MetainfoLoader {
  loadFromInfoHash (infoHash) {
    return new Promise((resolve) => {
      let client = new WebTorrent();
      let torrent = client.add(infoHash);
      torrent.on('metadata', () => {
        torrent.destroy();
        client.destroy();
        resolve({
          infoHash: torrent.infoHash,
          name: torrent.name,
          magnetLink: torrent.magnetURI,
          totalSize: torrent.length
          // torrentFile: torrent.torrentFile,
        });
      });
    });
  }
}
