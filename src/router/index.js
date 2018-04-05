import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import Storage from 'vue-web-storage';
import Settings from '@/components/Settings';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(Router);
Vue.use(BootstrapVue);
Vue.use(Storage, {
  prefix: 'blscrum_',
});

export default new Router({
  routes: [
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
  ],
});
