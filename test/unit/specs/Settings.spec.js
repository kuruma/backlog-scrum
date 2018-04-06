import Vue from 'vue';
import Settings from '@/components/Settings';

describe('Setting.vue', () => {
  xit('should render correct contents', () => {
    const Constructor = Vue.extend(Settings);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js App');
  });
});
