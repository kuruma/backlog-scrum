import { shallow } from '@vue/test-utils';
import Settings from '@/components/Settings';

const VALID_API_KEY = 'Dy52eJKpGXZjQdSB9WpyW3s4a7fn404OdZjNlaGi5Lprhlbf0h6K2sVpIfcemtDv';
const VALID_SPACEID = 'foobar';
const VALID_DOMAIN = 'backlog.com';
const VALID_FQDN = `${VALID_SPACEID}.${VALID_DOMAIN}`;

describe('Settings', () => {
  it('should be wrapped by .container node', () => {
    const wrapper = shallow(Settings);
    expect(wrapper.classes())
      .include('container');
  });

  it('should show only one header', () => {
    const wrapper = shallow(Settings);
    expect(wrapper.contains('h1'))
      .is.equal(true);
    expect(wrapper.findAll('h1').length)
      .is.equal(1);
    expect(wrapper.find('h1').text())
      .is.equal('設定');
  });

  it('should mirror API key from parent component to local', () => {
    const options = {
      propsData: {
        latestBacklogApiKey: VALID_API_KEY,
      },
    };
    const wrapper = shallow(Settings, options);
    expect(wrapper.vm.backlogApiKey)
      .is.equal(VALID_API_KEY);
  });

  it('should mirror FQDN from parent component to local', () => {
    const options = {
      propsData: {
        latestBacklogFqdn: VALID_FQDN,
      },
    };
    const wrapper = shallow(Settings, options);
    expect(wrapper.vm.backlogHostname)
      .is.equal(VALID_SPACEID);
    expect(wrapper.vm.backlogDomain)
      .is.equal(VALID_DOMAIN);
  });

  it('should emit event when parameters are updated', () => {
    const wrapper = shallow(Settings);
    const options = {
      backlogHostname: VALID_SPACEID,
      backlogDomain: VALID_DOMAIN,
    };
    const keyInput = wrapper.find('#apikey');
    const domInput = wrapper.find('#domain');
    const hosInput = wrapper.find('#spaceid');
    keyInput.trigger('keyup');
    domInput.trigger('change');
    hosInput.trigger('keyup');
    wrapper.setData(options);
    hosInput.trigger('keyup');
    expect(wrapper.emitted('notify-update-api-key').length)
      .is.equal(1);
    expect(wrapper.emitted('notify-update-fqdn').length)
      .is.equal(3);
    expect(wrapper.emitted('notify-update-fqdn')[1])
      .is.eql(['']);
    expect(wrapper.emitted('notify-update-fqdn')[2])
      .is.eql([VALID_FQDN]);
  });
});
