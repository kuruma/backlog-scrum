<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark sticky-top">
      <span class="navbar-brand mb-0 h1">Backlog Scrum</span>
      <ul class="navbar-nav mr-auto">
        <li class="nav-item" :class="{'active': $route.path === '/epics'}">
          <router-link to="/epics" class="nav-link">
            <icon name="chess" class="mr-1"></icon>エピック
          </router-link>
        </li>
      </ul>
      <ul class="navbar-nav">
        <li class="nav-item" :class="{'active': $route.path === '/settings'}">
          <router-link to="/settings" class="nav-link">
            <icon name="ellipsis-v" label="設定"></icon>
          </router-link>
        </li>
      </ul>
    </nav>
    <main>
      <router-view
        ref="main"
        />
    </main>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/ellipsis-v';
import 'vue-awesome/icons/chess';

export default {
  name: 'App',
  components: {
    Icon,
  },
  methods: {
    getUriQueries() {
      let queriesStr = window.location.search || '';
      queriesStr = queriesStr.substr(1, queriesStr.length);
      const queries = queriesStr.split('&');
      let bldomain;
      let blspace;
      let blkey;
      let blproj;
      for (let i = 0, l = queries.length; i < l; i += 1) {
        const query = (queries[i] || '').split('=');
        const key = query[0];
        const value = query[1];
        switch (key) {
          case 'bldomain':
            bldomain = value.toLowerCase();
            break;
          case 'blkey':
            blkey = value;
            break;
          case 'blspace':
            blspace = value;
            break;
          case 'blproj':
            blproj = value;
            break;
          default:
            break;
        }
      }
      return {
        blkey,
        blspace,
        bldomain,
        blproj,
      };
    },
  },
  async mounted() {
    const params = this.getUriQueries();
    try {
      await this.$store.dispatch('initialize', params);
      this.$refs.main.$emit('datastore-updated');
    } catch (e) {
      // TODO
    }
  },
};
</script>

<style>
@import url(http://fonts.googleapis.com/earlyaccess/notosansjp.css);
#app {
  font-family: 'Noto Sans JP',
    '游ゴシック Medium', '游ゴシック体', 'Yu Gothic Medium', YuGothic,
    'ヒラギノ角ゴ ProN', 'Hiragino Kaku Gothic ProN',
    'メイリオ', Meiryo,
    'ＭＳ Ｐゴシック', 'MS PGothic',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.fa-icon {
  width: auto;
  height: 1em;
  max-width: 100%;
  max-height: 100%;
}
</style>
