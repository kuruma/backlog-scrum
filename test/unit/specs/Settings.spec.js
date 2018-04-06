import { shallow } from '@vue/test-utils';
import Settings from '@/components/Settings';

describe('Setting', () => {
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
});
