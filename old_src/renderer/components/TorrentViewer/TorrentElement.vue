<template>
    <md-card>
        <md-card-header>
            <div class="md-title">{{torrentMetainfo.name}}</div>
            <div class="md-subhead">[{{torrentMetainfo.infoHash}}] {{ totalSize }}</div>
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
            <p v-if="timeRemaining && state === torrentState.downloading">
                time remaining: {{ timeRemaining }}
            </p>
            <p v-if="downloadSpeed && state === torrentState.downloading">
                download: {{ downloadSpeed }}
            </p>
            <p v-if="uploadSpeed && state === torrentState.downloading">
                upload: {{ uploadSpeed }}
            </p>
        </md-card-content>

        <md-card-actions>
            <md-button v-if="state === torrentState.stopped">
                <label :for="'file-selector-' + torrentMetainfo.infoHash" class="btn">Select...</label>
            </md-button>
            <md-button v-if="state === torrentState.stopped" v-on:click="triggerDownload">
                Start Download
            </md-button>
            <md-button v-if="state === torrentState.downloading" v-on:click="triggerPause">
                Pause Download
            </md-button>
            <md-button v-on:click="openFolder">
                Open Folder
            </md-button>
            <md-button v-on:click="removeTorrent">
                Remove
            </md-button>
        </md-card-actions>
    </md-card>
</template>

<script>
  const electron = require('electron');
  const prettyBytes = require('pretty-bytes');
  const prettyMilliseconds = require('pretty-ms');

  const torrentState = {
    stopped: 0,
    downloading: 1,
    finished: 2
  };

  export default {
    name: 'TorrentElement',
    methods: {
      triggerDownload () {
        electron.ipcRenderer.send('beginn-download', {
          infoHash: this.torrentMetainfo.infoHash,
          downloadPath: this.downloadPath,
          magnetLink: this.torrentMetainfo.magnetLink,
          torrentBuffer: this.torrentMetainfo.torrentBuffer
        });
        this.state = this.torrentState.downloading;
      },
      triggerPause () {
        electron.ipcRenderer.send('pause-download', this.torrentMetainfo.infoHash);
        this.downloadSpeed = undefined;
        this.uploadSpeed = undefined;
        this.state = this.torrentState.stopped;
      },
      removeTorrent () {
        electron.ipcRenderer.send('remove-torrent', this.torrentMetainfo.infoHash);
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
        totalSize: prettyBytes(this.torrentMetainfo.totalSize),
        downloadSpeed: undefined,
        uploadSpeed: undefined,
        torrentBuffer: this.torrentMetainfo.torrentBuffer,
        state: torrentState.stopped,
        torrentState: torrentState,
        timeRemaining: undefined
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
          this.timeRemaining = prettyMilliseconds(downloadInfo.timeRemaining);
        }
      });
      electron.ipcRenderer.on('upload-info', (event, uploadInfo) => {
        if (uploadInfo.infoHash === this.torrentMetainfo.infoHash) {
          this.uploadSpeed = prettyBytes(uploadInfo.uploadSpeed) + ' / sec';
        }
      });
      electron.ipcRenderer.on('download-done', (event, infoHash) => {
        if (infoHash === this.torrentMetainfo.infoHash) {
          this.downloadSpeed = undefined;
          this.uploadSpeed = undefined;
          this.state = torrentState.finished;
        }
      });
    }
  };
</script>

<style scoped>
</style>
