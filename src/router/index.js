import Vue from 'vue';
import Router from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import Settings from '@/components/Settings';
import Epics from '@/components/Epics';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(Router);
Vue.use(BootstrapVue);

export default new Router({
  routes: [
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
    {
      path: '/epics',
      name: 'Epics',
      component: Epics,
    },
  ],
});
