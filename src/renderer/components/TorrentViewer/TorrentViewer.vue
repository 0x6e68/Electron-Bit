<template>
    <div>
        <loading-magnet-link v-for="magnetLink in detectedMagnetLinks"
                             v-bind:key="magnetLink.infoHash"
                             :name="magnetLink.name"
                             :info-hash="magnetLink.infoHash"></loading-magnet-link>
        <hr/>

        <torrent-element v-for="torrentMetainfo in torrentMetainfos"
                         v-bind:key="torrentMetainfo.infoHash"
                         :torrent-metainfo="torrentMetainfo">
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
        torrentMetainfos: []
      };
    },
    mounted () {
      electron.ipcRenderer.on('magnet-link-detected', (event, magnetLink) => {
        console.log('magnet-link-detected');
        this.detectedMagnetLinks.push(magnetLink);
      });
      electron.ipcRenderer.on('torrent-loaded', (event, torrentMetainfo) => {
        this.removeFromLoadingMetainfos(torrentMetainfo.infoHash);
        this.torrentMetainfos.push(torrentMetainfo);
      });
    },
    methods: {
      removeFromLoadingMetainfos (infoHash) {
        this.detectedMagnetLinks = this.detectedMagnetLinks.filter((item) => item.infoHash !== infoHash);
      }
    }
  };
</script>

<style scoped>

</style>
