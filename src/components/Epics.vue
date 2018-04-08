<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>エピック</h1>
        <ol id="issues" class="list-group">
          <li v-for="issue in issues" :key="issue.id"
            class="list-group-item flex-column align-items-start mb-2">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{ issue.summary }}</h5>
              <small>{{ issue.created }}</small>
            </div>
            <div class="issue-details">
              <p class="mb-1">{{ issue.description }}</p>
              <small>{{ issue.createdUser.name }} @ {{ issue.created }}</small>
            </div>
          </li>
        </ol>
        <hr>
        {{ space.updated }}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'Epics',
  data() {
    return {
      issues: {},
      projects: {},
      space: {},
    };
  },
  methods: {
    requestor(path, queries = {}, resolve = (() => {}), reject = (() => {})) {
      const name = path.split('/')[0];
      const keys = Object.keys(queries);
      const l = keys.length;
      let qStr = '';
      for (let i = 0; i < l; i += 1) {
        qStr += '&';
        qStr += encodeURIComponent(keys[i]);
        qStr += '=';
        qStr += encodeURIComponent(queries[keys[i]]);
      }
      axios.get(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}${qStr}`)
        .then((res) => {
          Vue.set(this, name, res.data);
        })
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    },
    initialize() {
      new Promise((resolve, reject) => {
        this.requestor(`projects/${this.projectKey}`, {}, resolve, reject);
      }).then(() => {
        this.requestor('issues', {
          'projectId[]': this.projects.id,
          parentChild: 1, // Except child task
          count: 100,
          sort: 'updated',
        });
      });
    },
  },
  async created() {
    this.initialize(this.projectKey);
    this.requestSpaceInfo();
  },
  ...mapGetters({
    apiKey: 'backlogApiKey',
    fqdn: 'backlogFqdn',
    projectKey: 'backlogProjectKey',
  }),
};
</script>

<style scoped>
</style>
