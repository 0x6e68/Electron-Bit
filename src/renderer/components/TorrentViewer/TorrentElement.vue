<template>
    <div>
        <p>
            [{{torrentMetainfo.infoHash}}] {{torrentMetainfo.name}}
        </p>
        <p>
            <input type="text" :value="downloadPath" readonly>
            <button type="button">
                <label :for="'file_selector_' + torrentMetainfo.infoHash" class="btn">Select...</label>
            </button>
            <input v-on:change="changeDownloadPath" :id="'file_selector_' + torrentMetainfo.infoHash"
                   style="visibility:hidden;"
                   type="file" webkitdirectory>
            <button v-on:click="triggerDownload">Start Download</button>
        </p>

    </div>
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
