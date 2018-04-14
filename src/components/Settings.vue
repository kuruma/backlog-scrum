<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <b-row>
      <b-col>
        <h1 class="h2 border-bottom mt-2 mb-3">設定</h1>
        <b-card no-body>
          <b-tabs card no-fade>
            <b-tab title="接続先" active>
              <form>
                <div class="form-group row">
                  <label for="apikey" class="col-sm-3 col-md-2 col-form-label">APIキー</label>
                  <b-col>
                    <input v-model="backlogApiKey"
                      type="text" class="form-control" id="apikey"
                      placeholder="[個人設定] > [API] から新規に発行したAPIキーを入力"/>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="spaceid" class="col-sm-3 col-md-2 col-form-label">スペースID</label>
                  <b-col>
                    <div class="input-group pl-0 pr-0">
                      <div class="input-group-prepend">
                        <div class="input-group-text">https://</div>
                      </div>
                      <input v-model="backlogHostname"
                        type="text" class="form-control" id="spaceid" placeholder="ホスト部を入力"/>
                      <div class="input-group-postpend">
                        <div class="input-group-text">.{{ backlogDomain }}</div>
                      </div>
                    </div>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="domain" class="col-sm-3 col-md-2 col-form-label">接続先</label>
                  <b-col>
                    <select v-model="backlogDomain"
                      class="form-control" id="domain">
                      <option selected="selected">backlog.jp</option>
                      <option>backlog.com</option>
                    </select>
                  </b-col>
                </div>
              </form>
            </b-tab>
            <b-tab title="チーム">
              <form>
                <div class="form-group row">
                  <b-col class="text-right">
                    <b-button variant="secondary" v-if="isLockedTeamSettings"
                      @click="changeLockedTeamSettings(false)">
                      <icon name="unlock" class="mr-1"></icon>
                      再編集
                    </b-button>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="project" class="col-sm-3 col-md-2 col-form-label">プロジェクト</label>
                  <b-col sm="5" md="6">
                    <input :disabled="isLockedTeamSettings"
                      v-model="backlogProjectKey"
                      type="text" class="form-control" id="projectkey"
                      placeholder="プロジェクトキーかIDを入力"/>
                  </b-col>
                  <b-col size="4">
                    <b-button :disabled="isLockedTeamSettings"
                      @click="requestProjectParameters">設定を取り込む</b-button>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="epicid" class="col-sm-3 col-md-2 col-form-label">エピック</label>
                  <b-col>
                    <select v-model.number="backlogEpicId" :disabled="isLockedTeamSettings"
                      class="custom-select" id="epicid">
                      <option v-for="t in types" :value="t.id"
                        :key="`${t.projectId}_${t.id}`">{{ t.name }}</option>
                    </select>
                    <small class="form-text text-muted">選択した種別の親タスクがエピックとして扱われます。</small>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="storyid" class="col-sm-3 col-md-2 col-form-label">ユーザストーリ</label>
                  <b-col>
                    <select v-model.number="backlogUserStoryId" :disabled="isLockedTeamSettings"
                      class="custom-select" id="storyid">
                      <option v-for="t in types" :value="t.id"
                        :key="`${t.projectId}_${t.id}`">{{ t.name }}</option>
                    </select>
                    <small class="form-text text-muted">選択した種別の子タスクがユーザストーリとして扱われます。</small>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="taskids" class="col-sm-3 col-md-2 col-form-label">タスク</label>
                  <b-col>
                    <select v-model.number="backlogTaskIds" :disabled="isLockedTeamSettings"
                      class="custom-select" id="taskid" multiple>
                      <option v-for="t in types" :value="t.id"
                        :key="`${t.projectId}_${t.id}`">{{ t.name }}</option>
                    </select>
                    <small class="form-text text-muted">選択した種別の子タスクがユーザストーリに関連するタスクとして扱われます。</small>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="taskids" class="col-sm-3 col-md-2 col-form-label">カテゴリ</label>
                  <b-col>
                    <select v-model.number="backlogCategoryIds" :disabled="isLockedTeamSettings"
                      class="custom-select" id="categoryid" multiple>
                      <option v-for="c in categories" :value="c.id"
                        :key="`${c.projectId}_${c.id}`">{{ c.name }}</option>
                    </select>
                    <small class="form-text text-muted">
                      タスクやユーザストーリのフィルタリングに使用するカテゴリを選択します。
                      たとえばチーム名などを設定します。
                    </small>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="urgentid" class="col-sm-3 col-md-2 col-form-label">緊急タスク</label>
                  <b-col>
                    <select v-model.number="backlogUrgentId" :disabled="isLockedTeamSettings"
                      class="custom-select" id="urgent">
                      <option value="-1" selected>設定しない</option>
                      <option v-for="c in categories" :value="c.id"
                        :key="`${c.projectId}_${c.id}`">{{ c.name }}</option>
                    </select>
                    <small class="form-text text-muted">
                      ここで選択したカテゴリのユーザストーリやタスクを緊急タスクとして強調表示します。
                    </small>
                  </b-col>
                </div>
                <div class="form-group row">
                  <b-col class="text-right">
                    <b-button variant="primary" v-if="!isLockedTeamSettings"
                      @click="changeLockedTeamSettings(true)">
                      <icon name="lock" class="mr-1"></icon>
                      確定
                    </b-button>
                  </b-col>
                </div>
              </form>
            </b-tab>
            <b-tab title="同期">
              <form>
                <div class="form-group row">
                  <label for="firebaseuri" class="col-sm-3 col-md-2 col-form-label">
                    Firebase URI
                  </label>
                  <b-col sm="7" md="8">
                    <!-- TODO 初期値設定する -->
                    <input type="text" class="form-control" id="firebaseuri"
                      v-model="firebaseUri"
                      placeholder="Firebase Realtime DatabaseのURIを入力"/>
                  </b-col>
                  <b-col size="2">
                    <b-button @click="updateFirebaseUri">適用</b-button>
                  </b-col>
                </div>
              </form>
            </b-tab>
            <b-tab title="表示">
              <div>
                <b-form-checkbox id="viewmode" v-model="isFixedViewMode">
                  画面横に余白を入れて見やすくする
                </b-form-checkbox>
              </div>
            </b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import backlog from '@/utils/backlog';

import 'vue-awesome/icons/lock';
import 'vue-awesome/icons/unlock';

export default {
  name: 'Settings',
  mixins: [backlog],
  data() {
    return {
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
      this.requestor(`projects/${this.backlogProjectKey}/issueTypes`, undefined, 'types');
      this.requestor(`projects/${this.backlogProjectKey}/categories`, undefined, 'categories');
    },
    updateFirebaseUri() {
      this.$store.dispatch('updateFirebaseUri', document.getElementById('firebaseuri').value);
    },
    updateFqdn(obj) {
      // obj has each key from this: { hostname: 'FOO', domian: 'BAR' }
      let fqdn = '';
      if (obj.hostname) {
        fqdn = `${obj.hostname}.${this.backlogDomain}`;
      } else if (this.backlogHostname !== '') {
        fqdn = `${this.backlogHostname}.${obj.domain}`;
      }
      this.$store.dispatch('updateFqdn', fqdn);
    },
  },
  computed: {
    backlogApiKey: {
      get() {
        return this.$store.getters.backlogApiKey;
      },
      set(value) {
        this.$store.dispatch('updateApiKey', value);
      },
    },
    backlogCategoryIds: {
      get() {
        return this.$store.getters.backlogCategoryIds || [];
      },
      set(arr) {
        this.$store.dispatch('updateCategoryIds', arr.map(x => parseInt(x, 10)));
      },
    },
    backlogDomain: {
      get() {
        return this.$store.getters.backlogDomain || this.defaultDomain;
      },
      set(value) {
        this.updateFqdn({ domain: value });
      },
    },
    backlogEpicId: {
      get() {
        return this.$store.getters.backlogEpicId;
      },
      set(value) {
        this.$store.dispatch('updateEpicId', value);
      },
    },
    backlogEpicName() {
      let str = '';
      if (this.types.length > 0) {
        const index = this.types.findIndex(x => x.id === this.backlogEpicId);
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
    backlogHostname: {
      get() {
        return this.$store.getters.backlogHostname;
      },
      set(value) {
        this.updateFqdn({ hostname: value });
      },
    },
    backlogProjectKey: {
      get() {
        return this.$store.getters.backlogProjectKey;
      },
      set(value) {
        this.$store.dispatch('updateProjectKey', value);
      },
    },
    backlogTaskIds: {
      get() {
        return this.$store.getters.backlogTaskIds || [];
      },
      set(arr) {
        this.$store.dispatch('updateTaskIds', arr.map(x => parseInt(x, 10)));
      },
    },
    backlogUrgentId: {
      get() {
        return this.$store.getters.backlogUrgentId;
      },
      set(num) {
        this.$store.dispatch('updateUrgentId', num);
      },
    },
    backlogUserStoryId: {
      get() {
        return this.$store.getters.backlogUserStoryId;
      },
      set(num) {
        this.$store.dispatch('updateUserStoryId', num);
      },
    },
    firebaseUri: {
      get() {
        return this.$store.getters.firebaseUri;
      },
      set() {
      },
    },
    isFixedViewMode: {
      get() {
        return this.$store.getters.isFixedViewMode;
      },
      set(value) {
        this.$store.dispatch('changeViewMode', value);
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
button {
  width: 100%;
}
</style>
