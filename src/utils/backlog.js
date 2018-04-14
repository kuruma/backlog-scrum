import Vue from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  methods: {
    requestor(path, queries = {}, dataName) {
      const name = dataName || path.split('/')[0];
      return new Promise((resolve, reject) => {
        const keys = Object.keys(queries);
        const l = keys.length;
        let qStr = '';
        for (let i = 0; i < l; i += 1) {
          qStr += `&${keys[i]}=`;
          qStr += encodeURIComponent(queries[keys[i]]);
        }
        axios.get(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}${qStr}`)
          .then((res) => {
            Vue.set(this, name, res.data);
            resolve(res.status);
          }).catch(() => {
            reject(0);
          });
      });
    },
    postRequestor(path, queries = {}, dataName) {
      const name = dataName || path.split('/')[0];
      return new Promise((resolve, reject) => {
        axios.post(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}`, queries)
          .then((res) => {
            Vue.set(this, name, res.data);
            resolve(res.status);
          }).catch(() => {
            reject(0);
          });
      });
    },
  },
  computed: {
    ...mapGetters({
      apiKey: 'backlogApiKey',
      fqdn: 'backlogFqdn',
      projectKey: 'backlogProjectKey',
      isFixedViewMode: 'isFixedViewMode',
    }),
  },
};
