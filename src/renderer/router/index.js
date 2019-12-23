import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'torrent-viewer',
      component: require('@/components/TorrentViewer/TorrentViewer').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
