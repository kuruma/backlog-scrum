<template>
  <div :class="{ 'container-fluid': !isFixedViewMode, container: isFixedViewMode }">
    <div class="row">
      <div class="col">
        <h1 class="h2 border-bottom mt-2 mb-3">設定</h1>
        <form>
          <div class="form-group row">
            <label for="apikey" class="col-sm-3 col-md-2 col-form-label">APIキー</label>
            <div class="col">
              <input v-model="backlogApiKey"
                type="text" class="form-control" id="apikey"
                placeholder="[個人設定] > [API] から新規に発行したAPIキーを入力"/>
            </div>
          </div>
          <div class="form-group row">
            <label for="spaceid" class="col-sm-3 col-md-2 col-form-label">スペースID</label>
            <div class="col">
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
            </div>
          </div>
          <div class="form-group row">
            <label for="domain" class="col-sm-3 col-md-2 col-form-label">接続先</label>
            <div class="col">
              <select v-model="backlogDomain"
                class="form-control" id="domain">
                <option selected="selected">backlog.jp</option>
                <option>backlog.com</option>
              </select>
            </div>
          </div>
          <div class="form-group row">
            <label for="project" class="col-sm-3 col-md-2 col-form-label">プロジェクト</label>
            <div class="col">
              <input v-model="backlogProjectKey"
                type="text" class="form-control" id="projectkey"
                placeholder="プロジェクトキーかIDを入力"/>
            </div>
          </div>
          <div class="form-group row">
            <span class="col-sm-3 col-md-2 col-form-label mr-3">表示設定</span>
            <div class="form-check col pt-2 pb-2">
              <input v-model="isFixedViewMode"
                class="form-check-input" type="checkbox" value="" id="viewmode"/>
              <label class="form-check-label" for="viewmode">画面横に余白を入れて見やすくする</label>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      defaultDomain: 'backlog.jp',
    };
  },
  methods: {
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
</style>
