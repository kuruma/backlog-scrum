import Vue from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';
import qs from 'qs';

export default {
  data() {
    return {
      categories: [],
      epics: [],
      milestones: [],
      myself: {},
      projects: {},
      response: {},
      statuses: [],
      userStories: [],
      urgents: [],
    };
  },
  methods: {
    generateBacklogUriFromKeyId(keyId) {
      return `https://${this.fqdn}/view/${keyId}`;
    },
    loadBacklogCategories(projectId) {
      if (this.categories.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('categories', `projects/${projectId}/categories`);
    },
    loadBacklogEpics(projectId, epicIssueTypeId, statusIds, priorityVarId, maxResults) {
      const param = {
        projectId: [projectId],
        issueTypeId: [epicIssueTypeId],
        statusId: statusIds,
        parentChild: 1, // Except child task
        count: maxResults || 100, // Maximum
      };
      if (typeof priorityVarId === 'number') {
        param.sort = `customField_${priorityVarId}`;
      } else {
        param.sort = 'updated';
      }
      return this.getFromBacklog('epics', 'issues', param);
    },
    loadBacklogMilestones(projectId) {
      if (Object.keys(this.milestones).length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('milestones', `projects/${projectId}/versions`);
    },
    loadBacklogMyself() {
      if (Object.keys(this.myself).length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      return this.getFromBacklog('myself', 'users/myself');
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
    // loadBacklogUserStories(): Expect to use internally
    loadBacklogUserStories(variable, priorityVarId,
      projectId, issueTypeId, categoryIds,
      statusIds, relatedEpicIssueTypeIds, milestoneId,
      includeParentIssues, includeChildIssues, includeSingleIssues) {
      if (this.userStories.length > 0) {
        // this function should work only once
        return Promise.resolve('nothing to do');
      }
      const param = {
        projectId: [projectId],
        categoryId: categoryIds,
        count: 100, // Maximum
      };
      if (issueTypeId !== undefined) {
        param.issueTypeId = [issueTypeId];
      }
      if (statusIds !== undefined) {
        param.statusId = statusIds;
      }
      if (milestoneId !== undefined) {
        param.milestoneId = [milestoneId];
      }
      if (relatedEpicIssueTypeIds !== undefined) {
        param.parentIssueId = relatedEpicIssueTypeIds;
        param.parentChild = 2; // Only child tasks
      } else if (includeParentIssues && includeChildIssues && includeSingleIssues) {
        param.parentChild = 0;
      } else if (includeParentIssues && !includeChildIssues && includeSingleIssues) {
        param.parentChild = 1;
      } else if (!includeParentIssues && includeChildIssues && !includeSingleIssues) {
        param.parentChild = 2;
      } else if (!includeParentIssues && !includeChildIssues && includeSingleIssues) {
        param.parentChild = 3;
      } else if (includeParentIssues && !includeChildIssues && !includeSingleIssues) {
        param.parentChild = 4;
      }
      // FIXME: priorityVarId may less than 0
      if (typeof priorityVarId === 'number' && priorityVarId > 0) {
        param.sort = `customField_${priorityVarId}`;
      } else {
        param.sort = 'updated';
      }
      return this.getFromBacklog(variable, 'issues', param);
    },
    loadBacklogOngoingUserStories(projectId, milestoneId) {
      this.loadBacklogUserStories('userStories', undefined, projectId, undefined, undefined, undefined, undefined, milestoneId);
    },
    loadBacklogUncompletedUserStoriesRelatedEpics(projectId,
      userStoryIssueTypeId, statusIds, priorityVarId) {
      const epicIds = this.epics.map(epic => epic.id);
      this.loadBacklogUserStories('userStories', priorityVarId, projectId, userStoryIssueTypeId, undefined, statusIds, epicIds);
    },
    loadBacklogUrgentUserStories(projectId, urgentCategoryId, statusIds, priorityVarId) {
      this.loadBacklogUserStories('urgents', priorityVarId, projectId, undefined, [urgentCategoryId], statusIds);
    },
    overriteUpdatedDatetime(storyId, datetime) {
      const l = this.userStories.length;
      let targetStoryIndex = 0;
      for (; targetStoryIndex < l; targetStoryIndex += 1) {
        if (this.userStories[targetStoryIndex].id === storyId) {
          break;
        }
      }
      this.$set(this.userStories[targetStoryIndex], 'updated', datetime);
    },
    overwriteUserStory(story) {
      const l = this.userStories.length;
      let targetStoryIndex = 0;
      for (; targetStoryIndex < l; targetStoryIndex += 1) {
        if (this.userStories[targetStoryIndex].id === story.id) {
          break;
        }
      }
      if (targetStoryIndex >= l) {
        return false;
      }
      this.$set(this.userStories, targetStoryIndex, story);
      return true;
    },
    postBacklogComment(issueId, content) {
      const param = {
        content,
      };
      return this.postToBacklog(`issues/${issueId}/comments`, param);
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
    postBacklogNewUrgentTask(projectId, userStoryIssueTypeId, summary, teamCategories, milestoneId,
      description, responseStoreName) {
      const param = {
        projectId,
        issueTypeId: userStoryIssueTypeId,
        priorityId: 3, // FIXME: Should be customizable
        summary,
        categoryId: teamCategories,
        milestoneId: [milestoneId],
        description,
      };
      return this.postToBacklog('issues', param, responseStoreName);
    },
    postBacklogNewUserStoryRelatedEpic(projectId, userStoryIssueTypeId, /* epicIssueTypeId, */
      summary, teamCategories, description, responseStoreName) {
      // TODO: set epic id as parent issue
      const param = {
        projectId,
        issueTypeId: [userStoryIssueTypeId],
        priorityId: 3, // FIXME: Should be customizable
        // parentIssueId: epicIssueTypeId,
        summary,
        categoryId: teamCategories,
        description,
      };
      return this.postToBacklog('issues', param, responseStoreName);
    },
    updateAssigneeOfIssue(issueId, assigneeId) {
      const param = {};
      param.assigneeId = assigneeId;
      return this.patchToBacklog(`issues/${issueId}`, param);
    },
    updatePriorityOfIssue(issueId, priorityVarId, priority) {
      if (priorityVarId === undefined) {
        return Promise.reject('優先度の格納先が設定されていないため、保存に失敗しました。');
      }
      const param = {};
      param[`customField_${priorityVarId}`] = priority;
      return this.patchToBacklog(`issues/${issueId}`, param);
    },
    updateStatusOfIssue(issueId, statusId) {
      const param = {};
      param.statusId = statusId;
      return this.patchToBacklog(`issues/${issueId}`, param);
    },
    updateStoryPointOfIssue(issueId, storyPointVarId, storyPoint) {
      if (storyPointVarId === undefined) {
        return Promise.reject('ストーリポイントの格納先が設定されていないため、保存に失敗しました。');
      }
      const param = {};
      param[`customField_${storyPointVarId}`] = storyPoint;
      return this.patchToBacklog(`issues/${issueId}`, param);
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
    patchToBacklog(path, queries = {}, responseStoreName) {
      const params = new URLSearchParams();
      Object.keys(queries).forEach((prop) => {
        params.append(prop, queries[prop]);
      });
      return new Promise((resolve, reject) => {
        axios.patch(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}`, params)
          .then((res) => {
            if (responseStoreName !== undefined) {
              Vue.set(this, responseStoreName, res.data);
            }
            resolve(res.data);
          })
          .catch(() => {
            reject('予期せぬエラーが発生しました。');
          });
      });
    },
    postToBacklog(path, queries = {}, responseStoreName) {
      return new Promise((resolve, reject) => {
        axios.post(`https://${this.fqdn}/api/v2/${path}?apiKey=${this.apiKey}`, qs.stringify(queries),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
          .then((res) => {
            if (responseStoreName !== undefined) {
              Vue.set(this, responseStoreName, res.data);
            }
            resolve(res.data);
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
