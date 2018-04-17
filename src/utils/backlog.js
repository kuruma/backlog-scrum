import Vue from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      epics: [],
      projects: {},
      statuses: [],
      userStories: [],
    };
  },
  methods: {
    loadBacklogCategories(projectId) {
      if (this.categories.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('categories', `projects/${projectId}/categories`);
    },
    loadBacklogEpics(projectId, epicIssueTypeId, statusIds) {
      if (this.epics.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
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
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('projects', `projects/${this.projectKey}`);
    },
    loadBacklogStatuses() {
      if (this.statuses.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('statuses');
    },
    loadBacklogUserStories(projectId, userStoryIssueTypeId, statusIds, relatedEpicIssueTypeId) {
      if (this.userStories.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      const param = {
        projectId: [projectId],
        issueTypeId: [userStoryIssueTypeId],
        statusId: statusIds,
        count: 100, // Maximum
        sort: 'updated',
      };
      if (relatedEpicIssueTypeId !== undefined) {
        param.parentIssueId = [relatedEpicIssueTypeId];
        param.parentChild = 2; // Only child tasks
      }
      return this.getFromBacklog('userStories', 'issues', param);
    },
    postBacklogNewEpic(projectId, epicIssueTypeId, summary, description, responseStoreName) {
      const param = {
        projectId: [projectId],
        issueTypeId: [epicIssueTypeId],
        priorityId: 3, // FIXME: Should be customizable
        summary,
        description,
      };
      return this.postToBacklog('issues', param, responseStoreName);
    },
    postBacklogNewUserStoryRelatedEpic(projectId, userStoryIssueTypeId, /* epicIssueTypeId, */
      summary, teamCategories, description, responseStoreName) {
      // TODO: set epic id as parent issue
      const param = {
        projectId: [projectId],
        issueTypeId: [userStoryIssueTypeId],
        priorityId: 3, // FIXME: Should be customizable
        // parentIssueId: epicIssueTypeId,
        summary,
        categoryId: teamCategories,
        description,
      };
      return this.postToBacklog('issues', param, responseStoreName);
    },
    updatePriorityOfIssue(issueId, priorityVarId, priority) {
      if (priorityVarId === undefined) {
        return Promise.reject('優先度の格納先が設定されていないため、保存に失敗しました。');
      }
      const param = {};
      param[`customField_${priorityVarId}`] = priority;
      return this.postToBacklog(`issues/${issueId}`, param);
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
    postToBacklog(path, queries = {}, responseStoreName) {
      const params = new URLSearchParams();
      Object.keys(queries).forEach((prop) => {
        params.append(prop, queries[prop]);
      });
      return new Promise((resolve, reject) => {
        axios.post(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}`, params)
          .then((res) => {
            if (responseStoreName !== undefined) {
              Vue.set(this, responseStoreName, res.data);
            }
          })
          .catch(() => {
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
    activeStatusIds() {
      // FIXME: filtering rule should not hardcoded
      return this.statuses.filter(x => x.name !== '完了').map(x => x.id);
    },
    statusIds() {
      return this.statuses.map(x => x.id);
    },
  },
};
