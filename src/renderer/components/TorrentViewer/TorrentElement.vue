<template>
    <md-card>
        <md-card-header>
            <div class="md-title">{{torrentMetainfo.name}}</div>
            <div class="md-subhead">[{{torrentMetainfo.infoHash}}]</div>
        </md-card-header>

        <md-card-content>
            <p>
                <input id="download-path" type="text" :value="downloadPath" readonly>
                <input v-on:change="changeDownloadPath" :id="'file-selector-' + torrentMetainfo.infoHash"
                       style="visibility:hidden;"
                       type="file" webkitdirectory>
            </p>
            <p v-if="progress">
                <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
                {{ loadedSize }} / {{ totalSize }}
            </p>
            <p v-if="downloadSpeed">
                download:{{ downloadSpeed }}
            </p>
            <p v-if="uploadSpeed">
                upload:{{ uploadSpeed }}
            </p>
        </md-card-content>

        <md-card-actions>
            <md-button>
                <label :for="'file-selector-' + torrentMetainfo.infoHash" class="btn">Select...</label>
            </md-button>
            <md-button v-on:click="triggerDownload">
                Start Download
            </md-button>
            <md-button v-on:click="triggerPause">
                Pause Download
            </md-button>
            <md-button v-on:click="openFolder">
                Open Folder
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
        electron.ipcRenderer.send('beginn-download', {
          infoHash: this.torrentMetainfo.infoHash,
          downloadPath: this.downloadPath,
          magnetLink: this.torrentMetainfo.magnetLink
        });
      },
      triggerPause () {
        electron.ipcRenderer.send('pause-download', this.torrentMetainfo.infoHash);
        this.downloadSpeed = undefined;
        this.uploadSpeed = undefined;
      },
      changeDownloadPath (event) {
        this.downloadPath = event.target.files[0].path;
      },
      openFolder () {
        electron.ipcRenderer.send('open-folder', this.downloadPath);
      }
    },
    data () {
      return {
        downloadPath: this.torrentMetainfo.defaultDownloadPath,
        progress: 0,
        loadedSize: undefined,
        totalSize: undefined,
        downloadSpeed: undefined,
        uploadSpeed: undefined
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
          this.downloadSpeed = prettyBytes(downloadInfo.downloadSpeed) + ' / sec';
        }
      });
      electron.ipcRenderer.on('upload-info', (event, uploadInfo) => {
        if (uploadInfo.infoHash === this.torrentMetainfo.infoHash) {
          this.uploadSpeed = prettyBytes(uploadInfo.uploadSpeed) + ' / sec';
        }
      });
    }
  };
</script>

<style scoped>

</style>
