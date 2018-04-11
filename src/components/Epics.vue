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
          <li v-for="(epic, key) in epics" :key="epic.id"
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
              <b-button size="sm" class="float-right"
                v-b-tooltip.hover title="最上位に移動する"
                @click="moveEpicToTop(key)" v-if="key !== 0">
                <icon name="level-up-alt" lavel="最上位に移動する"/>
              </b-button>
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
import draggable from 'vuedraggable';
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';

import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/sync-alt';
import 'vue-awesome/icons/level-up-alt';

export default {
  name: 'Epics',
  mixins: [backlog],
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
    moveEpicToTop(key) {
      // FIXME: Should animate epics
      this.epics.unshift(this.epics.splice(key, 1)[0]);
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
    this.$on('datastore-updated', this.applyDatastore);
    console.log(this.$store.getters.projectHash);
    // datastore-updated only called this page is loaded at 1st time
    if (this.projectKey) {
      this.applyDatastore();
    }
  },
};
</script>

<style scoped>
</style>
