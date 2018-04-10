<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <div class="row mt-3">
      <div class="col">
        <p class="mt-2 text-center text-muted" v-if="loading">
          <icon name="sync-alt" scale="5" label="Loading..." spin></icon>
        </p>
        <draggable @end="movedEpic" :options="{
            animation: 250,
            delay: 50,
            handle: '.handle',
          }"
          element="ol" id="epics" class="list-group">
          <li v-for="epic in epics" :key="epic.id"
            class="list-group-item flex-column align-items-start mb-2">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">
                <span class="handle mr-2"><icon name="bars"></icon></span>
                {{ epic.summary }}
              </h5>
              <small>{{ epic.created }}</small>
            </div>
            <div class="epic-details">
              <p class="mb-1">{{ epic.description }}</p>
              <small>{{ epic.createdUser.name }} @ {{ epic.created }}</small>
              <button class="btn btn-outline-dark btn-sm float-right">
                <icon name="level-up-alt" lavel="最上位に移動する"/>
              </button>
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
import 'vue-awesome/icons/sync-alt';
import 'vue-awesome/icons/level-up-alt';

export default {
  name: 'Epics',
  data() {
    return {
      firstView: true,
      loading: true,
      epics: {},
      projects: {},
      space: {},
    };
  },
  components: {
    draggable,
    Icon,
  },
  methods: {
    movedEpic(event) {
      if (event.from !== event.to) {
        console.log(`${event.from.id} was updated`);
        console.log(`${event.to.id} was updated`);
      } else if (event.oldIndex !== event.newIndex) {
        console.log(`${event.from.id} was updated`);
      }
    },
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
    applyDatastore() {
      this.loading = true;
      this.requestor('space')
        .then(() =>
          this.requestor(`projects/${this.projectKey}`))
        .then(() =>
          this.requestor(
            'issues',
            {
              'projectId[]': this.projects.id,
              parentChild: 1, // Except child task
              count: 100,
              sort: 'updated',
            },
            'epics',
          ))
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          // TODO
        });
    },
  },
  created() {
    if (this.projectKey) {
      this.applyDatastore();
    } else {
      this.$on('datastore-updated', this.applyDatastore);
    }
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
