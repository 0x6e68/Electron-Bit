const {clipboard} = require('electron');
const WebTorrent = require('webtorrent');
const magnet = require('magnet-uri');

export default class TorrentClipboardListener {
  addListener (timeout, magnetlinkDetectedCallback, loadedTorrentCallback) {
    let contentCache;

    setInterval(() => {
      let content = clipboard.readText();

      if (content !== contentCache) {
        contentCache = content;

        console.log(content);
        if (content.startsWith('magnet:')) {
          const parsed = magnet.decode(content);

          console.log('new magnet link', parsed);
          magnetlinkDetectedCallback({
            name: parsed.name,
            infoHash: parsed.infoHash
          });

          const metaClient = new WebTorrent();

          metaClient.add(content);
          metaClient.on('torrent', function (torrent) {
            console.log('loaded meta informations of ', torrent.name);
            metaClient.remove(torrent);
            metaClient.destroy();
            loadedTorrentCallback({
              name: torrent.name,
              infoHash: torrent.infoHash,
              magnetLink: content,
              totalSize: torrent.length,
              downloadPath: torrent.path,
              files: []
            });
          });
        }
      }
    }, timeout);
  }
}
