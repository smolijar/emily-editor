import _ from 'lodash';
import asciidoc from '../../src/modes/asciidoc';

describe('Asciidoc mode', () => {
  const documentFromSource = source => new DOMParser().parseFromString(asciidoc.convert(source).html, 'text/html').body;
  const source = '= foo\nfoo\n\n== bar\nbar\n\n=== *baz*\n_quix_';
  const ninja = '{=O=O=}';
  const testContents = (src) => {
    const document = documentFromSource(src);
    it('Contains h1', () => {
      expect(document.querySelectorAll('h1').length).toBe(1);
    });
    it('Contains h2', () => {
      expect(document.querySelectorAll('h2').length).toBe(1);
    });
    it('Contains h3', () => {
      expect(document.querySelectorAll('h3').length).toBe(1);
    });
    it('Contains strong', () => {
      expect(document.querySelectorAll('strong').length).toBe(1);
    });
    it('Contains emphasis', () => {
      expect(document.querySelectorAll('em').length).toBe(1);
    });
  };
  describe('Simple rendering', () => testContents(source));
  describe('Ninja', () => {
    const withNinjas = source.split('\n').map(line => asciidoc.lineSafeInsert(line, ninja)).join('\n');
    describe('Ninja does not brake html', () => {
      testContents(withNinjas);
    });
    describe('All ninjas inserted on simple code', () => {
      it('Ninjas match number of lines', () => {
        expect(withNinjas.match(new RegExp(ninja, 'g')).length).toBe(source.split('\n').filter(x => x !== '').length);
      });
    });
  });
  describe('Autocomplete', () => {
    const refs = _.flatMap(asciidoc.convert(source).references, (x) => _.get(x, 'refs'));
    it('Contains plain heading reference', () => {
      expect(_.some(refs, { value: '_bar, bar', caption: 'bar', meta: 'reference' })).toBe(true);
    });
    it('Contains html heading reference with stripped caption', () => {
      expect(_.some(refs, { value: '_strong_baz_strong, baz', caption: 'baz', meta: 'reference' })).toBe(true);
    });
  });
});
