<template>
  <el-main v-loading="loading">
    <el-row>
      <el-col :span="12">
        <ul>
          <li v-for="s in userStories" :key="s.id">{{ s.issueKey }} : {{ s.summary }}</li>
        </ul>
      </el-col>
      <el-col :span="12">
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import backlog from '@/utils/backlog';

export default {
  name: 'UserStories',
  data() {
    return {
      loading: true,
    };
  },
  mixins: [
    backlog,
  ],
  computed: {
    activeStatusIds() {
      // FIXME: filtering rule should not hardcoded
      return this.statuses.filter(x => x.name !== '完了').map(x => x.id);
    },
    statusIds() {
      return this.statuses.map(x => x.id);
    },
  },
  methods: {
    applyDatastore() {
      this.loading = true;
      this.loadBacklogProject()
        .then(() =>
          this.loadBacklogStatuses())
        .then(() =>
          this.loadBacklogEpics(this.projects.id,
            this.$store.getters.backlogEpicId, this.activeStatusIds))
        .then(() =>
          this.loadBacklogUserStories(this.projects.id,
            this.$store.getters.backlogUserStoryId, this.activeStatusIds))
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          // FIXME: Should be error handling
          this.loading = false;
        });
    },
  },
  created() {
    this.$on('datastore-updated', this.applyDatastore);
    // datastore-updated only called this page is loaded at 1st time
    if (this.projectKey) {
      this.applyDatastore();
    }
  },
};
</script>

<style scoped>
main {
  height: 100%;
}
</style>
