<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-dark sticky-top">
      <span class="navbar-brand mb-0 h1">Backlog Scrum</span>
    </nav>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
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
