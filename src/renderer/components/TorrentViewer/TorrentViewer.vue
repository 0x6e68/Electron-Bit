<template>
    <div>
        <loading-magnet-link v-for="magnetLink in detectedMagnetLinks"
                             v-bind:key="magnetLink.infoHash"
                             :name="magnetLink.name"
                             :info-hash="magnetLink.infoHash"></loading-magnet-link>
        <hr/>

        <ready-to-start-torrent v-for="torrent in torrents"
                                v-bind:key="torrent.infoHash"
                                :torrent="torrent">
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
        torrents: []
      };
    },
    mounted () {
      electron.ipcRenderer.on('magnet-link-detected', (event, magnetLink) => {
        console.log('magnet-link-detected');
        this.detectedMagnetLinks.push(magnetLink);
      });
      electron.ipcRenderer.on('torrent-loaded', (event, torrent) => {
        this.detectedMagnetLinks = this.detectedMagnetLinks.filter((item) => item.infoHash !== torrent.infoHash);
        this.torrents.push(torrent);
      });
    }
  };
</script>

<style scoped>

</style>
