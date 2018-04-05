<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark sticky-top">
      <span class="navbar-brand mb-0 h1 mr-auto">Backlog Scrum</span>
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/settings" class="nav-link">
            <icon name="ellipsis-v" label="設定"></icon>
          </router-link>
        </li>
      </ul>
    </nav>
    <main>
      <router-view
        :latest-backlog-api-key="latestBacklogApiKey"
        @notify-update-api-key="requestUpdateBacklogApiKey"
        :latest-backlog-fqdn="latestBacklogFqdn"
        @notify-update-fqdn="requestUpdateBacklogFqdn"
        />
    </main>
  </div>
</template>

<script>
import Vue from 'vue';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/ellipsis-v';

export default {
  name: 'App',
  components: {
    Icon,
  },
  data() {
    return {
      latestBacklogApiKey: '',
      latestBacklogFqdn: '',
    };
  },
  methods: {
    requestUpdateBacklogApiKey(key) {
      if (key === '') {
        Vue.$storage.remove('backlogApiKey');
      } else {
        Vue.$storage.set('backlogApiKey', key);
      }
    },
    requestUpdateBacklogFqdn(fqdn) {
      if (fqdn === '') {
        Vue.$storage.remove('backlogFqdn');
      } else {
        Vue.$storage.set('backlogFqdn', fqdn);
      }
    },
  },
  created() {
    this.latestBacklogApiKey = Vue.$storage.hasKey('backlogApiKey')
      ? Vue.$storage.get('backlogApiKey')
      : '';
    this.latestBacklogFqdn = Vue.$storage.hasKey('backlogFqdn')
      ? Vue.$storage.get('backlogFqdn')
      : '';
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
