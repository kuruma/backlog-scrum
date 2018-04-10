<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark sticky-top">
      <span class="navbar-brand mb-0 h1">Backlog Scrum</span>
    </nav>
    <main>
      <router-view
        :backlog-api-key="latestBacklogApiKey"
        @notify-update-api-key="requestUpdateBacklogApiKey"
        :backlog-fqdn="latestBacklogFqdn"
        @notify-update-fqdn="requestUpdateBacklogFqdn"
        />
    </main>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'App',
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
</style>
