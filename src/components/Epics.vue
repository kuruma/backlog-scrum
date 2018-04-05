<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>エピック</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Epics',
  data() {
    return {
    };
  },
  props: {
    latestBacklogApiKey: String,
    latestBacklogFqdn: String,
  },
};
</script>

<style scoped>
</style>
