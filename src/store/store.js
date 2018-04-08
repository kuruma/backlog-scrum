import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const LOCAL_STORAGE_PREFIX = 'blscrum_';
const DEFAULT_VIEW_MODE = true;

const state = {
  backlogApiKey: '',
  backlogFqdn: '',
  backlogProjectKey: '',
  isFixedViewMode: DEFAULT_VIEW_MODE,
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
    const mode = (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}viewMode`).toLowerCase() === 'true');
    console.log(mode);
    commit('storeViewMode', (mode === null) ? DEFAULT_VIEW_MODE : mode);
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
  changeViewMode({ commit }, mode) {
    console.log(2, mode);
    commit('storeViewMode', mode);
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
  storeViewMode(s, mode) {
    state.isFixedViewMode = mode;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viewMode`, mode);
  },
};

const getters = {
  backlogApiKey: s => s.backlogApiKey,
  backlogDomain: s => s.backlogFqdn.split('.').slice(1).join('.'),
  backlogFqdn: s => s.backlogFqdn,
  backlogHostname: s => s.backlogFqdn.split('.')[0],
  backlogProjectKey: s => s.backlogProjectKey,
  isFixedViewMode: s => s.isFixedViewMode,
};

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
});
