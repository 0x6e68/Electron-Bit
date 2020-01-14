import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// @ts-ignore
import { MdButton, MdCard, MdContent, MdProgress } from 'vue-material/dist/components';

import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdCard);
Vue.use(MdProgress);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
