import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const LOCAL_STORAGE_PREFIX = 'blscrum_';

const state = {
  backlogApiKey: '',
  backlogFqdn: '',
};

const actions = {
  initialize({ commit }, params) {
    console.info(params);
    const key = (params.blkey !== undefined)
      ? params.blkey
      : localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`).toString()
        || '';
    const fqdn = (params.bldomain !== undefined && params.blspace !== undefined)
      ? `${params.blspace}.${params.bldomain}`
      : localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogFqdn`).toString()
        || '';
    commit('storeApiKey', key);
    commit('storeFqdn', fqdn);
  },
  updateApiKey({ commit }, key) {
    commit('storeApiKey', key);
  },
  updateFqdn({ commit }, fqdn) {
    commit('storeFqdn', fqdn);
  },
};

const mutations = {
  storeApiKey(s, str) {
    console.log('a:', str);
    state.backlogApiKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`, str);
  },
  storeFqdn(s, str) {
    console.log('f:', str);
    state.backlogFqdn = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogFqdn`, str);
  },
};

export default new Vuex.Store({
  state,
  actions,
  mutations,
});
