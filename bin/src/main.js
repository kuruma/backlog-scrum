// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    latestBacklogApiKey: '',
    latestBacklogFqdn: '',
    backlogApiKey: '',
    backlogFqdn: '',
  },
  router,
  components: { App },
  template: '<App/>',
  methods: {
    loadQuery() {
      let queriesStr = window.location.search || '';
      queriesStr = queriesStr.substr(1, queriesStr.length);
      const queries = queriesStr.split('&');
      let bldomain;
      let blspace;
      for (let i = 0, l = queries.length; i < l; i += 1) {
        const query = (queries[i] || '').split('=');
        const key = query[0];
        const value = query[0];
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
        if (bldomain !== undefined && blspace !== undefined) {
          Vue.$storage.set('backlogFqdn', `${blspace}.${bldomain}`);
        }
      }
    },
    setLatestParameter() {
      this.latestBacklogApiKey = Vue.$storage.hasKey('backlogApiKey')
        ? (Vue.$storage.get('backlogApiKey') || Vue.$storage.remove('backlogFqdn'))
        : '';
      this.latestBacklogFqdn = Vue.$storage.hasKey('backlogFqdn')
        ? (Vue.$storage.get('backlogFqdn') || Vue.$storage.remove('backlogFqdn'))
        : '';
    },
  },
  created() {
    this.loadQuery();
    this.setLatestParameter();
  },
});
