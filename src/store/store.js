import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const LOCAL_STORAGE_PREFIX = 'blscrum_';

const state = {
  backlogApiKey: '',
  backlogFqdn: '',
  backlogProjectKey: '',
};

const actions = {
  initialize({ commit }, params) {
    const key = (params.blkey !== undefined)
      ? params.blkey
      : localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`).toString()
        || '';
    const fqdn = (params.bldomain !== undefined && params.blspace !== undefined)
      ? `${params.blspace}.${params.bldomain}`
      : localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogFqdn`).toString()
        || '';
    const proj = (params.blproj !== undefined)
      ? params.blproj
      : localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogProj`).toString()
        || '';
    commit('storeApiKey', key);
    commit('storeFqdn', fqdn);
    commit('storeProjectKey', proj);
  },
  updateApiKey({ commit }, key) {
    commit('storeApiKey', key);
  },
  updateFqdn({ commit }, fqdn) {
    commit('storeFqdn', fqdn);
  },
  updateProjectKey({ commit }, key) {
    commit('storeProjectKey', key);
  },
};

const mutations = {
  storeApiKey(s, str) {
    state.backlogApiKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`, str);
  },
  storeFqdn(s, str) {
    state.backlogFqdn = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogFqdn`, str);
  },
  storeProjectKey(s, str) {
    state.backlogProjectKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogProj`, str);
  },
};

export default new Vuex.Store({
  state,
  actions,
  mutations,
});
