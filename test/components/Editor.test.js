import React from 'react';
import { mount } from 'enzyme';

import Editor from '../../src/components/Editor';
import dot from '../modes/dot';

const trimIndent = strings => strings.join('').split('\n').map(l => l.trim()).join('\n');

describe('<Editor />', () => {
  describe('Basic render', () => {
    it('Empty editor', () => {
      const content = '';
      const wrapper = mount(<Editor content={content} language={dot} />);
      expect(wrapper.instance().getValue()).toBe('');
    });
    it('NonEmpty editor', () => {
      const content = '# foo\n';
      const wrapper = mount(<Editor content={content} language={dot} />);
      expect(wrapper.instance().getValue()).toBe(content);
    });
  });
  describe('handleOutlineOrderChange', () => {
    const initialContent = trimIndent`
    . Foo
    foo foo foo
    .. Foo2
    foo2
    .. Foo2
    foo2 foo2
    . Bar
    .... Nasty bar skips level
    .... Nasty bar skips level again
    bar bar bar
    . Baz
    baz baz baz
    . Quix
    quix quix quix`;
    const getWrapper = () => mount(<Editor content={initialContent} language={dot} />);
    it('Don\'t swap (from = to)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      instance.handleOutlineOrderChange(null, { oldIndex: 2, newIndex: 2 });
      expect(instance.getValue()).toBe(initialContent);
    });
    it('Don\'t swap (both out of bound)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      instance.handleOutlineOrderChange(null, { oldIndex: 100, newIndex: 80 });
      expect(instance.getValue()).toBe(initialContent);
    });
    it('Don\'t swap (second out of bound)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      instance.handleOutlineOrderChange(null, { oldIndex: 100, newIndex: 0 });
      expect(instance.getValue()).toBe(initialContent);
    });
    it('Swap sections (down)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      const expected = trimIndent`
      . Bar
      .... Nasty bar skips level
      .... Nasty bar skips level again
      bar bar bar
      . Baz
      baz baz baz
      . Foo
      foo foo foo
      .. Foo2
      foo2
      .. Foo2
      foo2 foo2
      . Quix
      quix quix quix`;
      instance.handleOutlineOrderChange(null, { oldIndex: 0, newIndex: 2 });
      expect(instance.getValue()).toBe(expected);
    });
    it('Swap sections 2 (up)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      const expected = trimIndent`
      . Foo
      foo foo foo
      .. Foo2
      foo2
      .. Foo2
      foo2 foo2
      . Quix
      quix quix quix
      . Bar
      .... Nasty bar skips level
      .... Nasty bar skips level again
      bar bar bar
      . Baz
      baz baz baz`;
      instance.handleOutlineOrderChange(null, { oldIndex: 3, newIndex: 1 });
      expect(instance.getValue()).toBe(expected);
    });
    it('Swap to last (second out of bound)', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      const expected = trimIndent`
      . Bar
      .... Nasty bar skips level
      .... Nasty bar skips level again
      bar bar bar
      . Baz
      baz baz baz
      . Quix
      quix quix quix
      . Foo
      foo foo foo
      .. Foo2
      foo2
      .. Foo2
      foo2 foo2`;
      instance.handleOutlineOrderChange(null, { oldIndex: 0, newIndex: 100 });
      expect(instance.getValue()).toBe(expected);
    });
  });
});
