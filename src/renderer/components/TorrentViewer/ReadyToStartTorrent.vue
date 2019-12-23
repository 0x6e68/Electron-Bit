<template>
    <div>
        <p>
            [{{infoHash}}] {{name}}
        </p>
        <p>
            <input type="text" :value="downloadPath" readonly>
            <button type="button">
                <label for="files" class="btn">Select...</label>
            </button>
            <input v-on:change="changeDownloadPath" id="files" style="visibility:hidden;" type="file" webkitdirectory>
            <button v-on:click="triggerDownload">Start Download</button>
        </p>

    </div>
</template>

<script>
  const electron = require('electron');

  export default {
    name: 'ReadyToStartTorrent',
    methods: {
      triggerDownload () {
        console.log('beginn-download', this.infoHash);
        electron.ipcRenderer.send('beginn-download', {
          infoHash: this.infoHash,
          downloadPath: this.downloadPath,
          magnetLink: this.magnetLink
        });
      },
      changeDownloadPath (event) {
        this.downloadPath = event.target.files[0].path;
      }
    },
    data () {
      return {
        downloadPath: this.defaultDownloadPath
      };
    },
    props: {
      name: {
        type: String
      },
      infoHash: {
        type: String
      },
      defaultDownloadPath: {
        type: String
      },
      magnetLink: {
        type: String
      }
    }
  };
</script>

<style scoped>

</style>
