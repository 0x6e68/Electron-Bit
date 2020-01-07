import { EventEmitter } from 'events';
import WebTorrent, { Torrent } from 'webtorrent';

const CustomFSChunkStore = require('./storage/custom-fs-chunk-store.js');

export interface TorrentDownload {
  infoHash: string,
  downloadPath: string,
  torrentBuffer: Buffer
}

export interface DownloadClient {
  torrentDownload: TorrentDownload,
  instance: WebTorrent.Instance
}

export interface DownloadInfo {
  infoHash: string,
  totalDownloaded: number,
  torrentSize: number,
  downloadSpeed: number,
  uploadSpeed: number,
  progress: number,
  timeRemaining: number,
}

export interface UploadInfo {
  infoHash: string,
  uploadSpeed: number
}

export default class TorrentClient extends EventEmitter {
  private clients: DownloadClient[] = [];

  private createClient (spec: TorrentDownload) {
    const client = {
      torrentDownload: spec,
      instance: new WebTorrent()
    };

    client.instance.on('error', (err: any) => {
      console.log(err);
    });

    this.clients.push(client);
    return client;
  }

  private destroyClient (infoHash: string) {
    let client = this.clients.find((client) => client.torrentDownload.infoHash === infoHash);
    if (client) {
      client.instance.destroy((err: any) => {
        if (err) {
          console.log(err);
        }
        this.clients = this.clients.filter((client) => client.torrentDownload.infoHash !== infoHash);
      });
    }
  }

  buildDefaultTemporaryPath (infohash: string) {
    return require('path').join(CustomFSChunkStore.getDefaultTemporaryPath(), 'webtorrent', infohash);
  };

  pauseTorrent (infohash: string) {
    this.destroyClient(infohash);
  }

  download (torrentDownload: TorrentDownload) {
    const client = this.createClient(torrentDownload);
    const torrent: Torrent = client.instance.add(client.torrentDownload.torrentBuffer, {
      path: client.torrentDownload.downloadPath,
      store: function (chunkLength, storeOpts) {
        return new CustomFSChunkStore(chunkLength, { files: storeOpts.files });
      }
    });

    torrent.on('error', (err: any) => {
      console.log(err);
    });

    torrent.on('warning', (err: any) => {
      console.log(err);
    });

    torrent.on('metadata', () => {
      console.log('metadata');
    });

    torrent.on('ready', () => {
      console.log('ready');
    });

    torrent.on('download', (bytes: number) => {
      const downloadInfo: DownloadInfo = {
        infoHash: torrent.infoHash,
        totalDownloaded: torrent.downloaded,
        torrentSize: torrent.length,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        progress: torrent.progress,
        timeRemaining: torrent.timeRemaining
      };

      this.emit('download', downloadInfo);
    });

    torrent.on('upload', (bytes: number) => {
      const uploadInfo: UploadInfo = {
        infoHash: torrent.infoHash,
        uploadSpeed: torrent.uploadSpeed
      };

      this.emit('upload', uploadInfo);
    });

    torrent.on('done', () => {
      this.emit('done', torrent.infoHash);
    });
  }
}
