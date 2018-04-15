<template>
  <el-main v-loading="loading">
    <el-row>
      <el-col :span="12">
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
  methods: {
    applyDatastore() {
      this.loading = false;
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
