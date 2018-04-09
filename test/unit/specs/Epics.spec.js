import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import sinon from 'sinon';
import Epics from '@/components/Epics';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Epics', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
      },
    });
  });

  xit('should be wrapped by .container-fluid node in default', () => {
    const stub = sinon.stub(Epics.methods, 'requestor');
    const wrapper = shallow(Epics, { localVue, store });
    expect(wrapper.classes())
      .include('container-fluid');
    stub.restore();
  });

  xit('should be wrapped by .container-fluid node if a flag is true', () => {
  });
});
