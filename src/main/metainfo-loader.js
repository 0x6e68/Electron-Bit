const WebTorrent = require('webtorrent');

let openClients = [];

export default class MetainfoLoader {
  destroy () {
    for (let client of openClients) {
      client.destroy();
    }
  }

  loadFromTorrentIdentifier (torrentIdentifier) {
    return new Promise((resolve) => {
      let client = new WebTorrent();
      client.torrentIdentifier = torrentIdentifier;
      openClients.push(client);
      client.on('error', (err) => {
        console.log(err);
      });
      let torrent = client.add(torrentIdentifier);
      torrent.on('error', (err) => {
        console.log(err);
      });
      torrent.on('warning', (err) => {
        console.log(err);
      });
      torrent.on('metadata', () => {
        openClients = openClients.filter(c => c.torrentIdentifier !== torrentIdentifier);
        torrent.destroy();
        client.destroy();
        resolve({
          infoHash: torrent.infoHash,
          name: torrent.name,
          magnetLink: torrent.magnetURI,
          totalSize: torrent.length,
          torrentBuffer: torrent.torrentFile
        });
      });
    });
  }
}
