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
      // TODO send 'beginn-download' with TorrentDownload
      // TODO set state to downloading
    },
    triggerPause () {
      // TODO send 'pause-download' with torrentMetainfo.infoHash
      this.downloadSpeed = undefined;
      this.uploadSpeed = undefined;
      // TODO set state to stopped
    },
    removeTorrent () {
      // TODO send 'remove-torrent' with downloadPath
      this.downloadSpeed = undefined;
      this.uploadSpeed = undefined;
    },
    changeDownloadPath (event) {
      this.downloadPath = event.target.files[0].path;
    },
    openFolder () {
      // TODO send 'open-folder' with downloadPath
    }
  },
  data () {
    return {
      downloadPath: undefined, // TODO default path
      progress: 0,
      loadedSize: undefined,
      totalSize: undefined, // TODO
      downloadSpeed: undefined,
      uploadSpeed: undefined,
      torrentBuffer: undefined, // TODO
      state: undefined, // TODO
      torrentState: torrentState,
      timeRemaining: undefined
    };
  },
  props: [
    'torrentMetainfo'
  ],
  mounted () {
    electron.ipcRenderer.on('download-info', (event, downloadInfo) => {
      // TODO progress
      // TODO loadedSize (prettyBytes)
      // TODO totalSize (prettyBytes)
      // TODO downloadSpeed (prettyBytes)
      // TODO timeRemaining  (prettyMilliseconds)
    });

    electron.ipcRenderer.on('upload-info', (event, uploadInfo) => {
      // TODO update upload speed
    });

    electron.ipcRenderer.on('download-done', (event, infoHash) => {
      if (infoHash === this.torrentMetainfo.infoHash) {
        this.downloadSpeed = undefined;
        this.uploadSpeed = undefined;
        // TODO set state to finished
      }
    });
  }
};
</script>

<style scoped>
</style>
