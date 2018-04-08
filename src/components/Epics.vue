<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <div class="row">
      <div class="col">
        <h1>エピック</h1>
        <draggable @end="movedIssue" :options="{
            animation: 250,
            delay: 50,
            handle: '.handle',
          }"
          element="ol" id="issues" class="list-group">
          <li v-for="issue in issues" :key="issue.id"
            class="list-group-item flex-column align-items-start mb-2">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">
                <span class="handle mr-2"><icon name="bars"></icon></span>
                {{ issue.summary }}
              </h5>
              <small>{{ issue.created }}</small>
            </div>
            <div class="issue-details">
              <p class="mb-1">{{ issue.description }}</p>
              <small>{{ issue.createdUser.name }} @ {{ issue.created }}</small>
            </div>
          </li>
        </draggable>
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
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/bars';

export default {
  name: 'Epics',
  data() {
    return {
      issues: {},
      projects: {},
      space: {},
    };
  },
  components: {
    draggable,
    Icon,
  },
  methods: {
    movedIssue(event) {
      if (event.from !== event.to) {
        console.log(`${event.from.id} was updated`);
        console.log(`${event.to.id} was updated`);
      } else if (event.oldIndex !== event.newIndex) {
        console.log(`${event.from.id} was updated`);
      }
    },
    requestor(path, queries = {}) {
      return new Promise((resolve, reject) => {
        const name = path.split('/')[0];
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
    applyDatastore() {
      this.requestor('space')
        .then(() =>
          this.requestor(`projects/${this.projectKey}`))
        .then(() =>
          this.requestor(
            'issues', {
              'projectId[]': this.projects.id,
              parentChild: 1, // Except child task
              count: 100,
              sort: 'updated',
            }))
        .catch(() => {
          // TODO
        });
    },
  },
  created() {
    this.$on('datastore-updated', this.applyDatastore);
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
</script>

<style scoped>
</style>
