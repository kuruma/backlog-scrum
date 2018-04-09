import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import sinon from 'sinon';
import Settings from '@/components/Settings';

const VALID_API_KEY = 'Dy52eJKpGXZjQdSB9WpyW3s4a7fn404OdZjNlaGi5Lprhlbf0h6K2sVpIfcemtDv';
const VALID_SPACEID = 'foobar';
const VALID_DOMAIN = 'backlog.com';
const VALID_PROJ = 'deadbeaf';
const VALID_FQDN = `${VALID_SPACEID}.${VALID_DOMAIN}`;

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Settings', () => {
  let store;
  let actions;

  beforeEach(() => {
    actions = {
      updateApiKey: sinon.stub(),
      updateFqdn: sinon.stub(),
      updateProjectKey: sinon.stub(),
    };
    store = new Vuex.Store({
      state: {
        backlogApiKey: '',
        backlogFqdn: '',
        backlogProjectKey: '',
      },
      actions,
    });
  });

  xit('should be wrapped by .container node in default', () => {
    const wrapper = shallow(Settings, { localVue, store });
    expect(wrapper.classes())
      .include('container');
  });

  xit('should be wrapped by .container-fluid node if a flag is true', () => {
  });

  it('should show only one header', () => {
    const wrapper = shallow(Settings, { localVue, store });
    expect(wrapper.contains('h1'))
      .is.equal(true);
    expect(wrapper.findAll('h1').length)
      .is.equal(1);
    expect(wrapper.find('h1').text())
      .is.equal('設定');
  });

  xit('should load API key parameter from local store', () => {
    store.state.backlogApiKey = VALID_API_KEY;
    const wrapper = shallow(Settings, { localVue, store });
    expect(wrapper.vm.backlogApiKey)
      .is.equal(VALID_API_KEY);
  });

  xit('should load FQDN parameter from local store', () => {
    store.state.backlogFqdn = VALID_FQDN;
    const wrapper = shallow(Settings, { localVue, store });
    expect(wrapper.vm.backlogHostname)
      .is.equal(VALID_SPACEID);
    expect(wrapper.vm.backlogDomain)
      .is.equal(VALID_DOMAIN);
  });

  xit('should load project key from local store', () => {
    store.state.backlogProjectKey = VALID_PROJ;
    const wrapper = shallow(Settings, { localVue, store });
    expect(wrapper.vm.backlogProjectKey)
      .is.equal(VALID_PROJ);
  });

  xit('should update localstore when API key is updated', () => {
    const wrapper = shallow(Settings, { localVue, store });
    const options = {
      backlogHostname: VALID_SPACEID,
      backlogDomain: VALID_DOMAIN,
      backlogProj: VALID_PROJ,
    };
    const keyInput = wrapper.find('#apikey');
    const domInput = wrapper.find('#domain');
    const hosInput = wrapper.find('#spaceid');
    const proInput = wrapper.find('#projectkey');
    keyInput.trigger('keyup');
    domInput.trigger('change');
    hosInput.trigger('keyup');
    wrapper.setData(options);
    hosInput.trigger('keyup');
    proInput.trigger('keyup');
    expect(actions.updateApiKey.calledOnce)
      .is.equal(true);
    expect(actions.updateFqdn.callCount)
      .is.equal(3);
    expect(actions.updateFqdn.thirdCall.args[1])
      .is.eql(VALID_FQDN);
    expect(actions.updateProjectKey.calledOnce)
      .is.equal(true);
  });

  xit('should update localstore when viewmode is updated', () => {
  });

  it('should apply expected default values in forms', () => {
    const wrapper = shallow(Settings, { localVue, store });
    const keyInput = wrapper.find('#apikey');
    const domInput = wrapper.find('#domain');
    const hosInput = wrapper.find('#spaceid');
    const proInput = wrapper.find('#projectkey');
    const viewmodeCheck = wrapper.find('#viewmode');
    expect(keyInput.element.value)
      .is.equal('');
    expect(domInput.element.value)
      .is.not.equal('');
    expect(hosInput.element.value)
      .is.equal('');
    expect(viewmodeCheck.element.value)
      .is.equal('');
  });
});
