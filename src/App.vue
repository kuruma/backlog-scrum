<template>
  <div id="app">
    <el-container>
      <el-header class="headerWrapper">
        <el-row align="middle" type="flex">
          <el-col :span="4">
            <h1 class="brand">Backlog Scrum</h1>
          </el-col>
          <el-col :span="20">
            <el-menu mode="horizontal" :default-active="$route.path" :router="true">
              <template v-for="rule in $router.options.routes">
                <el-menu-item v-if="rule.group === 1" :index="rule.path" :key="rule.path">
                  <icon :name="rule.icon"
                    v-if="rule.icon !== undefined"></icon>
                  {{ rule.title }}
                </el-menu-item>
                <el-menu-item v-else :index="rule.path" :key="rule.path" class="weakitem">
                  <icon v-if="rule.icon !== undefined" :name="rule.icon" :label="rule.label"></icon>
                  <span v-if="rule.icon === undefined">{{ rule.title }}</span>
                </el-menu-item>
              </template>
            </el-menu>
          </el-col>
        </el-row>
      </el-header>
      <div class="contentsWrapper">
        <router-view
          ref="main"
          />
      </div>
    </el-container>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/ellipsis-v';
import 'vue-awesome/icons/chess';
import 'vue-awesome/icons/sort';

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
body {
  margin: 0;
}
.headerWrapper {
  position: fixed;
  background: #fff;
  z-index: 100;
  width: 100%;
}
.contentsWrapper {
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
}
.el-menu-item .fa-icon {
  margin-right: 0.25rem;
}
.el-menu .weakitem {
  float: right;
}
.brand {
  font-size: inherit;
  font-weight: bold;
}
</style>
