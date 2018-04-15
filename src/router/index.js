import Vue from 'vue';
import Router from 'vue-router';
import Settings from '@/components/Settings';
import Epics from '@/components/Epics';
import UserStories from '@/components/UserStories';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/epics',
      name: 'Epics',
      component: Epics,
      group: 1,
      icon: 'chess',
      title: 'エピック',
    },
    {
      path: '/stories',
      name: 'UserStories',
      component: UserStories,
      group: 1,
      icon: 'sort',
      title: 'ユーザストーリ',
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      group: 2,
      icon: 'ellipsis-v',
      title: '設定',
    },
  ],
});
