import WebTorrent, { Torrent } from 'webtorrent';
import { EventEmitter } from 'events';

export interface DownloadClientSpec {
    infoHash: string,
    downloadPath: string,
    torrentBuffer: Buffer
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

export class DownloadClient extends EventEmitter {
    downloadClientSpec: DownloadClientSpec;
    instance: WebTorrent.Instance;

    constructor (downloadClientSpec: DownloadClientSpec) {
      super();
      this.downloadClientSpec = downloadClientSpec;
      this.instance = new WebTorrent();
      this.instance.on('error', (err: any) => {
        this.emit('error', err);
      });
    }

    destroy (callback?: (err: Error | string) => void) {
      this.instance.destroy(callback);
    }

    beginnDownload () {
      const CustomFSChunkStore = require('./storage/custom-fs-chunk-store.js');

      let torrent: Torrent = this.instance.add(this.downloadClientSpec.torrentBuffer, {
        path: this.downloadClientSpec.downloadPath,
        store: (chunkLength, storeOpts) => {
          return new CustomFSChunkStore(chunkLength, { files: storeOpts.files });
        }
      });

      torrent.on('error', (err) => {
        this.emit('error', err);
      });

      torrent.on('warning', (err) => {
        this.emit('warning', err);
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
