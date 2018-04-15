<template>
  <el-main v-loading="loading">
    <el-row>
      <el-col>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
export default {
  name: 'UserStories',
  data() {
    return {
      loading: true,
    };
  },
};
</script>

<style scoped>
main {
  height: 100%;
}
</style>
