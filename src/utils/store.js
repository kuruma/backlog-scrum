import Vue from 'vue';
import Vuex from 'vuex';
import Jssha from 'jssha';

Vue.use(Vuex);

const LOCAL_STORAGE_PREFIX = 'blscrum_';
const DEFAULT_VIEW_MODE = true;

const state = {
  backlogApiKey: '',
  backlogCategoryIds: '',
  backlogEpicId: -1,
  backlogFqdn: '',
  backlogProjectKey: '',
  backlogTaskIds: [],
  backlogUrgentId: -1,
  backlogUserStoryId: -1,
  firebaseUri: '',
  isFixedViewMode: DEFAULT_VIEW_MODE,
  isLockedTeamSettings: false,
};

const actions = {
  initialize({ commit }, params) {
    return new Promise((resolve) => {
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
      const urgentid = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogUrgentId`) || '-1';
      const storyid = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogUserStoryId`) || '-1';
      const taskids = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogTaskIds`) || '[]';
      const categoryids = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}backlogCategoryIds`) || '[]';
      commit('storeEpicId', parseInt(epicid, 10));
      commit('storeUrgentId', parseInt(urgentid, 10));
      commit('storeUserStoryId', parseInt(storyid, 10));
      commit('storeTaskIds', JSON.parse(taskids));
      commit('storeCategoryIds', JSON.parse(categoryids));
      const modeStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}viewMode`);
      const mode = (typeof modeStr === 'string' && modeStr.toLowerCase() === 'true');
      commit('storeViewMode', (mode === null) ? DEFAULT_VIEW_MODE : mode);
      const fburi = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}firebaseUri`);
      commit('storeFirebaseUri', (typeof fburi === 'string') ? fburi : '');
      const locked = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}isLocked`) || false;
      commit('storeLockedTeamSettings', (typeof locked === 'string' && locked.toLocaleLowerCase() === 'true'));
      resolve();
    });
  },
  updateApiKey({ commit }, key) {
    commit('storeApiKey', key);
  },
  updateCategoryIds({ commit }, ids) {
    commit('storeCategoryIds', ids);
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
  updateUrgentId({ commit }, id) {
    commit('storeUrgentId', id);
  },
  updateUserStoryId({ commit }, id) {
    commit('storeUserStoryId', id);
  },
  changeViewMode({ commit }, mode) {
    commit('storeViewMode', mode);
  },
  changeLockedTeamSettings({ commit }, bool) {
    commit('storeLockedTeamSettings', bool);
  },
};

const mutations = {
  storeApiKey(s, str) {
    state.backlogApiKey = str;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogApiKey`, str);
  },
  storeCategoryIds(s, ids) {
    state.backlogCategoryIds = ids;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogCategoryIds`, JSON.stringify(ids));
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
  storeUrgentId(s, num) {
    state.backlogUrgentId = num;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogUrgentId`, num);
  },
  storeUserStoryId(s, num) {
    state.backlogUserStoryId = num;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}backlogUserStoryId`, num);
  },
  storeViewMode(s, mode) {
    state.isFixedViewMode = mode;
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viewMode`, mode);
  },
  storeLockedTeamSettings(s, bool) {
    state.isLockedTeamSettings = bool;
    if (bool) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}isLocked`, bool);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}isLocked`);
    }
  },
};

const getters = {
  backlogApiKey: s => s.backlogApiKey,
  backlogCategoryIds: s => s.backlogCategoryIds,
  backlogDomain: s => s.backlogFqdn.split('.').slice(1).join('.'),
  backlogEpicId: s => s.backlogEpicId,
  backlogFqdn: s => s.backlogFqdn,
  backlogHostname: s => s.backlogFqdn.split('.')[0],
  backlogProjectKey: s => s.backlogProjectKey,
  backlogTaskIds: s => s.backlogTaskIds,
  backlogUrgentId: s => s.backlogUrgentId,
  backlogUserStoryId: s => s.backlogUserStoryId,
  firebaseUri: s => s.firebaseUri,
  isFixedViewMode: s => s.isFixedViewMode,
  isLockedTeamSettings: s => s.isLockedTeamSettings,
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
