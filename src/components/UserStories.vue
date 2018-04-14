<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <b-row class="mt-3">
      <b-col>
        <p class="mt-2 text-center text-muted" v-if="loading">
          <icon name="spinner" scale="5" label="Loading..." spin></icon>
        </p>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/spinner';

export default {
  name: 'Userstories',
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    isFixedViewMode: {
      get() {
        return this.$store.getters.isFixedViewMode;
      },
      set(value) {
        this.$store.dispatch('changeViewMode', value);
      },
    },
  },
  components: {
    Icon,
  },
};
</script>

<style scoped>
</style>
