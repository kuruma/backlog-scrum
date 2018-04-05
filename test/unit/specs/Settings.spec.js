import Vue from 'vue';
import Setting from '@/components/Setting';

describe('Setting.vue', () => {
  xit('should render correct contents', () => {
    const Constructor = Vue.extend(Setting);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js App');
  });
});
