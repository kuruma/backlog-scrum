import Vue from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  data() {
    return {
      epics: [],
      projects: {},
      statuses: [],
      userStories: [],
    };
  },
  methods: {
    loadBacklogEpics(projectId, epicIssueTypeId, statusIds) {
      if (this.epics.length > 0) {
        // this function should work only once
        return this.nothingToDo();
      }
      const param = {
        projectId: [projectId],
        issueTypeId: [epicIssueTypeId],
        statusId: statusIds,
        parentChild: 1, // Except child task
        count: 100, // Maximum
        sort: 'updated',
      };
      return this.getFromBacklog('epics', 'issues', param);
    },
    loadBacklogProject() {
      if (Object.keys(this.projects).length > 0) {
        // this function should work only once
        return this.nothingToDo();
      }
      return this.getFromBacklog('projects', `projects/${this.projectKey}`);
    },
    loadBacklogStatuses() {
      if (this.statuses.length > 0) {
        // this function should work only once
        return this.nothingToDo();
      }
      return this.getFromBacklog('statuses');
    },
    loadBacklogUserStories(projectId, userStoryIssueTypeId, statusIds) {
      if (this.userStories.length > 0) {
        // this function should work only once
        return this.nothingToDo();
      }
      const param = {
        projectId: [projectId],
        issueTypeId: [userStoryIssueTypeId],
        statusId: statusIds,
        count: 100, // Maximum
        sort: 'updated',
      };
      return this.getFromBacklog('userStories', 'issues', param);
    },
    nothingToDo() {
      return new Promise((resolve) => {
        resolve();
      });
    },
    requestor(path, queries = {}, dataName) { // Obsolete
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
    getFromBacklog(name, path, queries = {}) {
      const p = (path === undefined) ? name : path;
      return new Promise((resolve, reject) => {
        axios.get(`https://${this.fqdn}/api/v2/${p}?apiKey=${this.apiKey}`, { params: queries })
          .then((res) => {
            Vue.set(this, name, res.data);
            resolve(res.status);
          })
          .catch(() => {
            reject(0);
          });
      });
    },
    postRequestor(path, queries = {}, dataName) { // Obsolete
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
