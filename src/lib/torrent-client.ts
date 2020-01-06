import { DownloadClient, DownloadClientSpec, DownloadInfo, UploadInfo } from '@/lib/download-client';
import { EventEmitter } from 'events';

export default class TorrentClient extends EventEmitter {
  private clients: DownloadClient[] = [];

  private createClient (spec: DownloadClientSpec): DownloadClient {
    const client = new DownloadClient(spec);

    client.on('error', (err: any) => {
      console.log(err);
    });

    client.on('warning', (err: any) => {
      console.log(err);
    });

    client.on('download', (downloadInfo: DownloadInfo) => {
      this.emit('download', downloadInfo);
    });

    client.on('upload', (uploadInfo: UploadInfo) => {
      this.emit('upload', uploadInfo);
    });

    client.on('done', (infoHash: string) => {
      this.emit('done', infoHash);
    });

    this.clients.push(client);
    return client;
  }

  private destroyClient (infoHash: string) {
    let client = this.clients.find((client) => client.downloadClientSpec.infoHash === infoHash);
    if (client) {
      client.destroy((err: any) => {
        if (err) {
          console.log(err);
        }
        this.clients = this.clients.filter((client) => client.downloadClientSpec.infoHash !== infoHash);
      });
    }
  }

  buildDefaultTemporaryPath (infohash: string) {
    return require('path').join(require('./storage/custom-fs-chunk-store.js').getDefaultTemporaryPath(), 'webtorrent', infohash);
  };

  pauseTorrent (infohash: string) {
    this.destroyClient(infohash);
  }

  destroy () {
    for (let client of this.clients) {
      client.destroy();
    }
  }

  downloadTorrent (spec: DownloadClientSpec) {
    let client = this.createClient(spec);
    client.beginnDownload();
  }
}
