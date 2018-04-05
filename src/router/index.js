import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import Storage from 'vue-web-storage';
import Setting from '@/components/Setting';

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
      path: '/setting',
      name: 'Setting',
      component: Setting,
    },
  ],
});
