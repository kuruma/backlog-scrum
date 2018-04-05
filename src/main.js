// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data() {
    return {
      latestBacklogApiKey: '',
      latestBacklogFqdn: '',
      backlogApiKey: '',
      backlogFqdn: '',
    };
  },
  router,
  components: { App },
  template: '<App/>',
  methods: {
    cleanupLocalStorage() {
      const keys = [
        'backlogApiKey',
        'backlogFqdn',
      ];
      for (let i = 0, l = keys.length; i < l; i += 1) {
        if (Vue.$storage.hasKey(keys[i]) && Vue.$storage.get(keys[i] === '')) {
          Vue.$storage.remove(keys[i]);
        }
      }
    },
    loadQuery() {
      let queriesStr = window.location.search || '';
      queriesStr = queriesStr.substr(1, queriesStr.length);
      const queries = queriesStr.split('&');
      let bldomain;
      let blspace;
      for (let i = 0, l = queries.length; i < l; i += 1) {
        const query = (queries[i] || '').split('=');
        const key = query[0];
        const value = query[1];
        switch (key) {
          case 'bldomain':
            bldomain = value.toLowerCase();
            break;
          case 'blkey':
            Vue.$storage.set('backlogApiKey', value);
            break;
          case 'blspace':
            blspace = value;
            break;
          default:
            break;
        }
      }
      if (bldomain !== undefined && blspace !== undefined) {
        Vue.$storage.set('backlogFqdn', `${blspace}.${bldomain}`);
      }
    },
  },
  created() {
    this.loadQuery();
    this.cleanupLocalStorage();
  },
});
