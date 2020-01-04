<template>
    <div>
        <loading-magnet-link v-for="magnetLink in detectedMagnetLinks"
                             v-bind:key="magnetLink.infoHash"
                             :name="magnetLink.name"
                             :info-hash="magnetLink.infoHash"
                             class="torrent-element-container">
        </loading-magnet-link>

        <torrent-element v-for="torrent in torrents"
                         v-bind:key="torrent.infoHash"
                         :torrent-metainfo="torrent"
                         class="torrent-element-container">
        </torrent-element>
    </div>
</template>

<script>
  import LoadingMagnetLink from './LoadingMagnetLink';
  import TorrentElement from './TorrentElement';

  const electron = require('electron');

  export default {
    name: 'TorrentViewer',
    components: {TorrentElement, LoadingMagnetLink},
    data () {
      return {
        detectedMagnetLinks: [],
        torrents: []
      };
    },
    mounted () {
      electron.ipcRenderer.on('magnet-link-detected', (event, magnetLink) => {
        this.detectedMagnetLinks.push(magnetLink);
      });
      electron.ipcRenderer.on('torrent-loaded', (event, torrent) => {
        console.log('torrent-loaded', torrent.infoHash);
        this.removeFromLoadingMetainfos(torrent.infoHash);
        this.torrents.push(torrent);
      });
      electron.ipcRenderer.on('torrent-removed', (event, infoHash) => {
        this.removeTorrent(infoHash);
      });
    },
    methods: {
      removeFromLoadingMetainfos (infoHash) {
        this.detectedMagnetLinks = this.detectedMagnetLinks.filter((item) => item.infoHash !== infoHash);
      },
      removeTorrent (infoHash) {
        this.torrents = this.torrents.filter((item) => item.infoHash !== infoHash);
      }
    }
  };
</script>

<style scoped>
    .torrent-element-container {
        margin: 10px 15px;
    }
</style>
