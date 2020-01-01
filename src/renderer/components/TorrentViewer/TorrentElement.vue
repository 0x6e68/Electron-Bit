<template>
    <md-card>
        <md-card-header>
            <div class="md-title">{{torrentMetainfo.name}}</div>
            <div class="md-subhead">[{{torrentMetainfo.infoHash}}]</div>
        </md-card-header>

        <md-card-content>
                <input type="text" :value="downloadPath" readonly>
                <input v-on:change="changeDownloadPath" :id="'file_selector_' + torrentMetainfo.infoHash"
                       style="visibility:hidden;"
                       type="file" webkitdirectory>
        </md-card-content>

        <md-card-actions>
            <md-button>
                <label :for="'file_selector_' + torrentMetainfo.infoHash" class="btn">Select...</label>
            </md-button>
            <md-button v-on:click="triggerDownload">
                Start Download
            </md-button>
        </md-card-actions>
    </md-card>
</template>

<script>
  const electron = require('electron');

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
      changeDownloadPath (event) {
        console.log(this.torrentMetainfo.infoHash, event.target.files[0].path);
        this.downloadPath = event.target.files[0].path;
      }
    },
    data () {
      return {
        downloadPath: this.torrentMetainfo.defaultDownloadPath
      };
    },
    props: [
      'torrentMetainfo'
    ]
  };
</script>

<style scoped>

</style>
