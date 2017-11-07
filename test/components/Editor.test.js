import React from 'react';
import { mount } from 'enzyme';

import Editor from '../../src/components/Editor';
import markdown from '../../src/modes/markdown';

describe('<Editor />', () => {
  it('Empty editor', () => {
    const content = '';
    const wrapper = mount(<Editor content={content} language={markdown} />);
    expect(wrapper.instance().getValue()).toBe('');
  });
  it('NonEmpty editor', () => {
    const content = '# foo\n';
    const wrapper = mount(<Editor content={content} language={markdown} />);
    expect(wrapper.instance().getValue()).toBe(content);
  });
});
