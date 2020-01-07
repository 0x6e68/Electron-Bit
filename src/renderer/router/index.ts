import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'torrent-viewer',
    component: require('@/components/TorrentViewer/TorrentViewer').default
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  routes
});

export default router;
