import WebTorrent from 'webtorrent';
import { Instance as ParseTorrent } from 'parse-torrent';

export interface Metadata {
  infoHash: string,
  name: string,
  magnetLink: string,
  totalSize: number,
  torrentBuffer: Buffer,
  defaultDownloadPath: string
}

export type TorrentIdentifier = string | Buffer | File | ParseTorrent;

export default class MetadataLoader {
  loadFromTorrentIdentifier (torrentIdentifier: TorrentIdentifier): Promise<Metadata> {
    return new Promise((resolve) => {
      let client = new WebTorrent();

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
        torrent.destroy();
        client.destroy();

        resolve({
          infoHash: torrent.infoHash,
          name: torrent.name,
          magnetLink: torrent.magnetURI,
          totalSize: torrent.length,
          torrentBuffer: torrent.torrentFile,
          defaultDownloadPath: ''
        });
      });
    });
  }
}
