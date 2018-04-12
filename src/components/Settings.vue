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
                  <label for="project" class="col-sm-3 col-md-2 col-form-label">プロジェクト</label>
                  <b-col sm="5" md="6">
                    <input v-model="backlogProjectKey"
                      type="text" class="form-control" id="projectkey"
                      placeholder="プロジェクトキーかIDを入力"/>
                  </b-col>
                  <b-col size="4">
                    <b-button @click="requestIssueTypes">種別情報を反映</b-button>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="epicid" class="col-sm-3 col-md-2 col-form-label">エピック</label>
                  <b-col>
                    <b-form-select v-model.number="backlogEpicId"
                      :options="types" size="auto" id="epicid"/>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="storyid" class="col-sm-3 col-md-2 col-form-label">ユーザストーリ</label>
                  <b-col>
                    <b-form-select v-model.number="backlogUserStoryId" :options="types"
                      size="auto" id="storyid"/>
                  </b-col>
                </div>
                <div class="form-group row">
                  <label for="taskids" class="col-sm-3 col-md-2 col-form-label">タスク</label>
                  <b-col>
                    <b-form-select multiple :select-size="4" v-model="backlogTaskIds"
                      :options="types" size="auto" id="taskid"/>
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
                  固定幅で表示する
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
import backlog from '@/utils/backlog';

export default {
  name: 'Settings',
  mixins: [backlog],
  data() {
    return {
      defaultDomain: 'backlog.jp',
      types: [],
    };
  },
  methods: {
    requestIssueTypes() {
      this.requestor(`projects/${this.backlogProjectKey}/issueTypes`, undefined, 'types');
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
  },
};
</script>

<style scoped>
button {
  width: 100%;
}
</style>
