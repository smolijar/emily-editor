import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Editor from '../../components/Editor';
import markdown from '../../modes/markdown';

describe('<Editor />', () => {
  it('foo test', () => {
    const content = '# foo\n';
    const wrapper = mount(<Editor content={content} language={markdown} />);
    expect(wrapper.find('div').length).to.greaterThan(1);
  });
});
