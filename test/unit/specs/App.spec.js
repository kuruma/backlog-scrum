import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import sinon from 'sinon';
import App from '@/App';
import VueRouter from 'vue-router';

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(Vuex);
const router = new VueRouter();

describe('App', () => {
  let store;
  let actions;

  beforeEach(() => {
    actions = {
      initialize: sinon.stub(),
    };
    store = new Vuex.Store({
      state: {},
      actions,
    });
  });

  it('should be wrapped a root node named app', () => {
    const wrapper = shallow(App, { localVue, router, store });
    expect(wrapper.element.id)
      .is.equal('app');
  });
});
