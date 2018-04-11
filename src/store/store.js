import Vue from 'vue';
import Vuex from 'vuex';
import Jssha from 'jssha';

Vue.use(Vuex);

const LOCAL_STORAGE_PREFIX = 'blscrum_';
const DEFAULT_VIEW_MODE = true;

const state = {
  backlogApiKey: '',
  backlogEpicId: -1,
  backlogFqdn: '',
  backlogProjectKey: '',
  backlogTaskIds: [],
  backlogUserStoryId: -1,
  firebaseUri: '',
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
    const epicid = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogEpicId`) || '-1';
    const storyid = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogStoryId`) || '-1';
    const taskids = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogTaskIds`) || '[]';
    commit('storeEpicId', parseInt(epicid, 10));
    commit('storeUserStoryId', parseInt(storyid, 10));
    commit('storeTaskIds', JSON.parse(taskids));
    const modeStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}viewMode`);
    const mode = (modeStr === undefined) ? false : (modeStr.toLowerCase() === 'true');
    commit('storeViewMode', (mode === null) ? DEFAULT_VIEW_MODE : mode);
    const fburi = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}firebaseUri`);
    commit('storeFirebaseUri', (fburi === undefined) ? '' : fburi.toString());
  },
  updateApiKey({ commit }, key) {
    commit('storeApiKey', key);
  },
  updateEpicId({ commit }, id) {
    commit('storeEpicId', id);
  },
  updateFirebaseUri({ commit }, uri) {
    commit('storeFirebaseUri', uri);
  },
  updateFqdn({ commit }, fqdn) {
    commit('storeFqdn', fqdn);
  },
  updateProjectKey({ commit }, key) {
    commit('storeProjectKey', key);
  },
  updateTaskIds({ commit }, ids) {
    commit('storeTaskIds', ids);
  },
  updateUserStoryId({ commit }, id) {
    commit('storeUserStoryId', id);
  },
  changeViewMode({ commit }, mode) {
    commit('storeViewMode', mode);
  },
};

const mutations = {
  storeApiKey(s, str) {
    state.backlogApiKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`, str);
  },
  storeEpicId(s, num) {
    state.backlogEpicId = num;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogEpicId`, num);
  },
  storeFirebaseUri(s, str) {
    state.firebaseUri = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}firebaseUri`, str);
  },
  storeFqdn(s, str) {
    state.backlogFqdn = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogFqdn`, str);
  },
  storeProjectKey(s, str) {
    state.backlogProjectKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogProj`, str);
  },
  storeTaskIds(s, arr) {
    state.backlogTaskIds = arr;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogTaskIds`, JSON.stringify(arr));
  },
  storeUserStoryId(s, num) {
    state.backlogUserStoryId = num;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogUserStoryId`, num);
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
  firebaseUri: s => s.firebaseUri,
  isFixedViewMode: s => s.isFixedViewMode,
  projectHash: (s) => {
    const sha = new Jssha('SHA3-224', 'TEXT');
    sha.update(`${s.backlogHostname}.${s.backlogDomain}@${s.backlogProjectKey}`);
    return sha.getHash('HEX');
  },
};

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
});
