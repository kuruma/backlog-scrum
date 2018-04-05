<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>設定</h1>
        <form>
          <div class="form-group row">
            <label for="apikey" class="col-sm-3 col-md-2 col-form-label">APIキー</label>
            <input v-model="backlogApiKey" @keyup="updateBacklogApiKey"
              type="text" class="col-sm-9 col-md-10 form-control" id="apikey"
              placeholder="[個人設定] > [API] から新規に発行したAPIキーを入力"/>
          </div>
          <div class="form-group row">
            <label for="spaceid" class="col-sm-3 col-md-2 col-form-label">スペースID</label>
            <div class="input-group col-sm-9 col-md-10 pl-0 pr-0">
              <div class="input-group-prepend">
                <div class="input-group-text">https://</div>
              </div>
              <input v-model="backlogHostname" @keyup="updateBacklogFqdn"
                type="text" class="form-control" id="spaceid" placeholder="ホスト部を入力"/>
              <div class="input-group-postpend">
                <div class="input-group-text">.{{ backlogDomain }}</div>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <label for="domain" class="col-sm-3 col-md-2 col-form-label">接続先</label>
            <select v-model="backlogDomain" @change="updateBacklogFqdn"
              class="col-sm-9 col-md-10 form-control" id="domain">
              <option selected="selected">backlog.jp</option>
              <option>backlog.com</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  data() {
    return {
      backlogApiKey: '',
      backlogDomain: 'backlog.jp',
      backlogFqdn: '',
      backlogHostname: '',
    };
  },
  props: {
    latestBacklogApiKey: String,
    latestBacklogFqdn: String,
  },
  methods: {
    updateBacklogApiKey() {
      this.$emit('notify-update-api-key', this.backlogApiKey);
    },
    updateBacklogFqdn() {
      if (this.backlogHostname === '') {
        this.backlogFqdn = '';
      } else {
        this.backlogFqdn = `${this.backlogHostname}.${this.backlogDomain}`;
      }
      this.$emit('notify-update-fqdn', this.backlogFqdn);
    },
  },
  mounted() {
    this.backlogApiKey = this.latestBacklogApiKey;
    if (this.latestBacklogFqdn) {
      const domains = this.latestBacklogFqdn.split('.');
      if (domains.length === 3) {
        this.backlogHostname = domains.shift();
        this.backlogDomain = domains.join('.');
      }
    }
  },
};
</script>

<style scoped>
</style>
