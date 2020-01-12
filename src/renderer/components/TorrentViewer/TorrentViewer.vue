<template>
    <div>
        <loading-magnet-link v-for="magnetLink in detectedMagnetLinks"
                             v-bind:key="magnetLink.infoHash"
                             :name="magnetLink.name"
                             :info-hash="magnetLink.infoHash"
                             class="torrent-element-container">
        </loading-magnet-link>

        <torrent-element v-for="metainfo in metainfos"
                         v-bind:key="metainfo.infoHash"
                         :torrent-metainfo="metainfo"
                         class="torrent-element-container">
        </torrent-element>
    </div>
</template>

<script>
import LoadingMagnetLink from './LoadingMagnetLink';
import TorrentElement from './TorrentElement';
import { Metadata } from '../../../lib/metadata-loader';

const electron = require('electron');

export default {
  name: 'TorrentViewer',
  components: { TorrentElement, LoadingMagnetLink },
  data () {
    return {
      detectedMagnetLinks: [],
      metainfos: []
    };
  },
  mounted () {
    electron.ipcRenderer.on('magnet-link-detected', (event, magnetLink) => {
      // TODO
    });

    electron.ipcRenderer.on('torrent-loaded', (event, metainfo) => {
      // TODO Metadata
    });

    electron.ipcRenderer.on('torrent-removed', (event, infoHash) => {
      // TODO
    });
  },
  methods: {
    removeFromLoadingMetainfos (infoHash) {
      // TODO
    },
    removeTorrent (infoHash) {
      // TODO
    }
  }
};
</script>

<style scoped>
    .torrent-element-container {
        margin: 10px 15px;
    }
</style>
