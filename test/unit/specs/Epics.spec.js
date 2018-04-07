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

  it('should be wrapped by .container node', () => {
    const stub = sinon.stub(Epics.methods, 'requestor');
    const wrapper = shallow(Epics, { localVue, store });
    expect(wrapper.classes())
      .include('container');
    stub.restore();
  });

  it('should show only one header', () => {
    const stub = sinon.stub(Epics.methods, 'requestor');
    const wrapper = shallow(Epics, { localVue, store });
    expect(wrapper.contains('h1'))
      .is.equal(true);
    expect(wrapper.findAll('h1').length)
      .is.equal(1);
    expect(wrapper.find('h1').text())
      .is.equal('エピック');
    stub.restore();
  });
});
