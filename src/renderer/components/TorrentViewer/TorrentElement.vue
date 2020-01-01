<template>
    <md-card>
        <md-card-header>
            <div class="md-title">{{torrentMetainfo.name}}</div>
            <div class="md-subhead">[{{torrentMetainfo.infoHash}}]</div>
        </md-card-header>

        <md-card-content>
            <p>
                <input type="text" :value="downloadPath" readonly>
                <input v-on:change="changeDownloadPath" :id="'file_selector_' + torrentMetainfo.infoHash"
                       style="visibility:hidden;"
                       type="file" webkitdirectory>
            </p>
            <p>
                <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
                {{ loadedSize }} / {{ totalSize }}
            </p>
            <p>
                download:{{ downloadSpeed }}
            </p>
            <p>
                upload:{{ uploadSpeed }}
            </p>
        </md-card-content>

        <md-card-actions>
            <md-button>
                <label :for="'file_selector_' + torrentMetainfo.infoHash" class="btn">Select...</label>
            </md-button>
            <md-button v-on:click="triggerDownload">
                Start Download
            </md-button>
            <md-button v-on:click="triggerPause">
                Pause Download
            </md-button>
        </md-card-actions>
    </md-card>
</template>

<script>
  const electron = require('electron');
  const prettyBytes = require('pretty-bytes');

  export default {
    name: 'TorrentElement',
    methods: {
      triggerDownload () {
        console.log('beginn-download', this.torrentMetainfo.infoHash);
        electron.ipcRenderer.send('beginn-download', {
          infoHash: this.torrentMetainfo.infoHash,
          downloadPath: this.downloadPath,
          magnetLink: this.torrentMetainfo.magnetLink
        });
      },
      triggerPause () {
        console.log('pause', this.torrentMetainfo.infoHash);
        electron.ipcRenderer.send('pause-download', this.torrentMetainfo.infoHash);
      },
      changeDownloadPath (event) {
        console.log(this.torrentMetainfo.infoHash, event.target.files[0].path);
        this.downloadPath = event.target.files[0].path;
      }
    },
    data () {
      return {
        downloadPath: this.torrentMetainfo.defaultDownloadPath,
        progress: 0,
        loadedSize: 'N/A',
        totalSize: 'N/A',
        downloadSpeed: 'N/A',
        uploadSpeed: 'N/A'
      };
    },
    props: [
      'torrentMetainfo'
    ],
    mounted () {
      electron.ipcRenderer.on('download-info', (event, downloadInfo) => {
        if (downloadInfo.infoHash === this.torrentMetainfo.infoHash) {
          this.progress = downloadInfo.progress * 100;
          this.loadedSize = prettyBytes(downloadInfo.totalDownloaded);
          this.totalSize = prettyBytes(downloadInfo.torrentSize);
          this.downloadSpeed = prettyBytes(downloadInfo.downloadSpeed) + '/ sec';
          this.uploadSpeed = prettyBytes(downloadInfo.uploadSpeed) + '/ sec';
        }
      });
    }
  };
</script>

<style scoped>

</style>
