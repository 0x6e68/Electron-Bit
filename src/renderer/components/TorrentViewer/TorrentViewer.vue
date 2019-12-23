<template>
    <div>
        <loading-magnet-link v-for="magnetLink in detectedMagnetLinks"
                             :name="magnetLink.name"
                             :info-hash="magnetLink.infoHash"></loading-magnet-link>
        <hr/>

        <ready-to-start-torrent v-for="torrent in loadedTorrents"
                                :name="torrent.name"
                                :info-hash="torrent.infoHash"
                                :magnet-link="torrent.magnetLink"
                                :default-download-path="torrent.downloadPath">
        </ready-to-start-torrent>
    </div>
</template>

<script>
  import LoadingMagnetLink from './LoadingMagnetLink';
  import ReadyToStartTorrent from './ReadyToStartTorrent';

  const electron = require('electron');

  export default {
    name: 'TorrentViewer',
    components: {ReadyToStartTorrent, LoadingMagnetLink},
    data () {
      return {
        detectedMagnetLinks: [],
        loadedTorrents: []
      };
    },
    mounted () {
      electron.ipcRenderer.on('magnet-link-detected', (event, magnetLink) => {
        this.detectedMagnetLinks.push(magnetLink);
      });
      electron.ipcRenderer.on('torrent-loaded', (event, torrent) => {
        this.detectedMagnetLinks = this.detectedMagnetLinks.filter((item) => item.infoHash !== torrent.infoHash);
        this.loadedTorrents.push(torrent);
      });
    }
  };
</script>

<style scoped>

</style>
