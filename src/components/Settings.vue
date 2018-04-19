<template>
  <!-- TODO: Rewirte as vue-router and navs are separated by el-aside -->
  <el-main>
    <el-row>
      <el-col :span="4">
        <el-menu :default-active="activeView" @select="setActiveView">
          <el-menu-item index="backlog">
            <icon name="server"/>
            接続先
          </el-menu-item>
          <el-menu-item index="team">
            <icon name="users"/>
            チーム
          </el-menu-item>
          <el-menu-item index="sync" disabled>
            <icon name="sync-alt"/>
            同期
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="20">
        <el-form v-if="activeView === 'backlog'" label-width="10rem">
          <el-form-item label="APIキー">
            <el-input v-model="backlogFormApikey" clearable
              :disabled="isLockedTeamSettings"
              placeholder="[個人設定] > [API] から発行したキーを入力"/>
          </el-form-item>
          <el-form-item label="スペースID">
            <el-input v-model="backlogFormSpaceid"
              :disabled="isLockedTeamSettings
                || typeof backlogFormDomain !== 'string'
                || backlogFormDomain.length === 0"
              placeholder="ホスト名">
              <template slot="prepend">https://</template>
              <template slot="append">{{ backlogFormDomain }}</template>
            </el-input>
          </el-form-item>
          <el-form-item label="backlogサーバ">
            <el-select v-model="backlogFormDomain" placeholder="選択してください"
              :disabled="isLockedTeamSettings">
              <el-option value="backlog.jp" label="backlog.jp"/>
              <el-option value="backlog.com" label="backlog.com"/>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button v-if="isLockedTeamSettings" @click="changeLockedTeamSettings(false)">
              <icon name="unlock"/>
              ロック解除
            </el-button>
          </el-form-item>
        </el-form>
        <el-form v-if="activeView === 'team'" label-width="10rem">
          <!-- TODO: Change projects -->
          <el-form-item label="プロジェクト">
            <el-input v-model="teamFormProjectKey" clearable
              :disabled="isLockedTeamSettings"
              placeholder="プロジェクトキーかIDを入力"/>
          </el-form-item>
          <el-form-item>
            <el-button @click="requestProjectParameters"
              :disabled="isLockedTeamSettings">
              設定を取り込む
            </el-button>
          </el-form-item>
        </el-form>
        <el-form v-if="activeView === 'team' && requestedProjectParameters === true"
          v-loading="!loadedParameters" label-width="10rem">
          <el-form-item label="エピック">
            <el-select v-model.number="teamFormEpicId" :disabled="isLockedTeamSettings"
              aria-describedby="teamFormEpicIdHelp">
              <el-option v-for="t in types" :key="`${t.projectId}_${t.id}`"
                :value="t.id" :label="t.name"/>
            </el-select>
            <small id="teamFormEpicIdHelp">
              選択した種別の親タスクがエピックとして扱われます。
            </small>
          </el-form-item>
          <el-form-item label="ユーザストーリ">
            <el-select v-model.number="teamFormUserStoryId" :disabled="isLockedTeamSettings"
              aria-describedby="teamFormUserStoryIdHelp">
              <el-option v-for="t in types" :key="`${t.projectId}_${t.id}`"
                :value="t.id" :label="t.name"/>
            </el-select>
            <small id="teamFormUserStoryIdHelp">
              選択した種別の子タスクがユーザストーリとして扱われます。
            </small>
          </el-form-item>
          <el-form-item label="タスク">
            <el-select v-model="teamFormTaskIds" :disabled="isLockedTeamSettings"
              multiple aria-describedby="teamFormTaskIdsHelp">
              <el-option v-for="t in types" :value="t.id"
                :key="`${t.projectId}_${t.id}`" :label="t.name"/>
            </el-select>
            <small id="teamFormTaskIdsHelp">
              選択した種別の子タスクがユーザストーリに関連するタスクとして扱われます。
            </small>
          </el-form-item>
          <!-- FIXME: garbage was shown in this form -->
          <el-form-item label="カテゴリ">
            <el-select v-model="teamFormCategoryIds" :disabled="isLockedTeamSettings"
              multiple aria-describedby="teamFormCategoryIdsHelp">
              <el-option v-for="c in categories" :value="c.id"
                :key="`${c.projectId}_${c.id}`" :label="c.name"/>
            </el-select>
            <small id="teamFormCategoryIdsHelp">
              タスクやユーザストーリのフィルタリングに使用するカテゴリを選択します。
              たとえばチーム名などを設定します。
            </small>
          </el-form-item>
          <el-form-item label="緊急タスク">
            <el-select v-model.number="teamFormUrgentId" :disabled="isLockedTeamSettings"
              clearable aria-describedby="teamFormUrgentIdHelp">
              <el-option v-for="c in categories" :value="c.id"
                :key="`${c.projectId}_${c.id}`" :label="c.name"/>
            </el-select>
            <small id="teamFormUrgentIdHelp">
              ここで選択したカテゴリのユーザストーリやタスクを緊急タスクとして強調表示します。
            </small>
          </el-form-item>
          <el-form-item>
            <el-button v-if="isLockedTeamSettings" @click="changeLockedTeamSettings(false)">
              <icon name="unlock"/>
              ロック解除
            </el-button>
            <el-button v-if="!isLockedTeamSettings" @click="changeLockedTeamSettings(true)"
              type="primary">
              <icon name="lock"/>
              ロック
            </el-button>
         </el-form-item>
        </el-form>
        <el-form v-if="activeView === 'sync'" label-width="10rem">
          <el-form-item label="Firebase URI">
            <el-input v-model="syncFormFirebaseUri" ref="firebaseUri" clearable
              placeholder="Firebase Realtime DatabaseのURIを入力"/>
          </el-form-item>
          <el-form-item>
            <el-button @click="updateFirebaseUri" type="primary">
              適用
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';

import 'vue-awesome/icons/server';
import 'vue-awesome/icons/users';
import 'vue-awesome/icons/sync-alt';
import 'vue-awesome/icons/lock';
import 'vue-awesome/icons/unlock';

export default {
  name: 'Settings',
  mixins: [backlog],
  data() {
    return {
      loadedCategories: false,
      loadedIssueTypes: false,
      requestedProjectParameters: false,
      activeView: 'backlog',
      defaultDomain: 'backlog.jp',
      categories: [],
      types: [],
    };
  },
  components: {
    Icon,
  },
  methods: {
    changeLockedTeamSettings(toLocked) {
      this.isLockedTeamSettings = toLocked;
    },
    requestProjectParameters() {
      if (!this.requestedProjectParameters
        && this.readyToRequestProjectParameters) {
        this.requestedProjectParameters = true;
        this.requestor(`projects/${this.teamFormProjectKey}/issueTypes`, undefined, 'types')
          .then(() => {
            this.loadedIssueTypes = true;
          });
        this.requestor(`projects/${this.teamFormProjectKey}/categories`, undefined, 'categories')
          .then(() => {
            this.loadedCategories = true;
          });
      }
    },
    setActiveView(idx) {
      this.requestProjectParameters();
      this.activeView = idx;
    },
    updateFirebaseUri() {
      this.$store.dispatch('updateFirebaseUri', this.$refs.firebaseUri.$el.value);
    },
    updateFqdn(obj) {
      // obj has each key from this: { hostname: 'FOO', domian: 'BAR' }
      let fqdn = '';
      if (obj.hostname) {
        fqdn = `${obj.hostname}.${this.backlogFormDomain}`;
      } else if (this.backlogFormSpaceid !== '') {
        fqdn = `${this.backlogFormSpaceid}.${obj.domain}`;
      }
      this.$store.dispatch('updateFqdn', fqdn);
    },
  },
  computed: {
    backlogFormApikey: {
      get() {
        return this.$store.getters.backlogApiKey;
      },
      set(value) {
        this.$store.dispatch('updateApiKey', value);
      },
    },
    backlogFormDomain: {
      get() {
        return this.$store.getters.backlogDomain || this.defaultDomain;
      },
      set(value) {
        this.updateFqdn({ domain: value });
      },
    },
    backlogFormSpaceid: {
      get() {
        return this.$store.getters.backlogHostname;
      },
      set(value) {
        this.updateFqdn({ hostname: value });
      },
    },
    loadedParameters() {
      return (this.loadedCategories && this.loadedIssueTypes);
    },
    readyToRequestProjectParameters() {
      return (this.backlogFormApikey
        && this.backlogFormSpaceid
        && this.backlogFormDomain
        && this.teamFormProjectKey);
    },
    syncFormFirebaseUri: {
      get() {
        return this.$store.getters.firebaseUri;
      },
      set() {
      },
    },
    teamFormCategoryIds: {
      get() {
        return this.$store.getters.backlogCategoryIds || [];
      },
      set(arr) {
        this.$store.dispatch('updateCategoryIds', arr.map(x => parseInt(x, 10)));
      },
    },
    teamFormEpicId: {
      get() {
        return this.$store.getters.backlogEpicId;
      },
      set(value) {
        this.$store.dispatch('updateEpicId', value);
      },
    },
    teamFormProjectKey: {
      get() {
        return this.$store.getters.backlogProjectKey;
      },
      set(value) {
        this.$store.dispatch('updateProjectKey', value);
      },
    },
    teamFormTaskIds: {
      get() {
        return this.$store.getters.backlogTaskIds || [];
      },
      set(arr) {
        this.$store.dispatch('updateTaskIds', arr.map(x => parseInt(x, 10)));
      },
    },
    teamFormUrgentId: {
      get() {
        return this.$store.getters.backlogUrgentId;
      },
      set(num) {
        this.$store.dispatch('updateUrgentId', num);
      },
    },
    teamFormUserStoryId: {
      get() {
        return this.$store.getters.backlogUserStoryId;
      },
      set(num) {
        this.$store.dispatch('updateUserStoryId', num);
      },
    },
    backlogEpicName() {
      let str = '';
      if (this.types.length > 0) {
        const index = this.types.findIndex(x => x.id === this.teamFormEpicId);
        console.log(this.types[index]);
        str = this.types[index].name;
      }
      return str;
    },
    backlogFqdn: {
      get() {
        return this.$store.getters.backlogFqdn;
      },
      set(value) {
        this.$store.dispatch('updateFqdn', value);
      },
    },
    isLockedTeamSettings: {
      get() {
        return this.$store.getters.isLockedTeamSettings;
      },
      set(value) {
        this.$store.dispatch('changeLockedTeamSettings', value);
      },
    },
  },
  created() {
    this.$on('datastore-updated', this.requestProjectParameters);
    // datastore-updated only called this page is loaded at 1st time
    if (this.projectKey) {
      this.requestProjectParameters();
    }
  },
};
</script>

<style scoped>
.el-form-item small {
  display: block;
  line-height: 1rem;
  color: #909399; /* Same as secondary text */
}
</style>
