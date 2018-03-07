import _ from 'lodash';
import { nthIndexOf, moveSubstring, generateOutline, findNextSibling, findWordBounds } from '../../src/helpers/helpers';
import { toHtmlWithNinjas } from '../../src/components/editor/lineNinja';
import dot from '../modes/dot';

const html = src => toHtmlWithNinjas(src, dot.lineSafeInsert, dot.toHtml);


describe('nthIndexOf', () => {
  const hexabeth = '0123456789ABCDEF';
  it(`${hexabeth} find first`, () => {
    expect(nthIndexOf(hexabeth, '5', 1)).toBe(5);
  });
  it(`${hexabeth} find default (expect first)`, () => {
    expect(nthIndexOf(hexabeth, 'A')).toBe(10);
  });

  const roses = 'Roses are red, violets are blue, suger is sweet and so are you.';
  it('Poems everybody! First', () => {
    expect(nthIndexOf(roses, 'are')).toBe(roses.indexOf('are'));
  });
  it('Poems everybody! Third', () => {
    expect(nthIndexOf(roses, 'are', 3)).toBe(55);
  });
});


describe('moveSubstring', () => {
  const hexabeth = '0123456789ABCDEF';
  it('Move to beginnig', () => {
    expect(moveSubstring(hexabeth, 10, 16, 0)).toBe('ABCDEF0123456789');
  });
  it('Move before cut', () => {
    expect(moveSubstring(hexabeth, 10, 13, 5)).toBe('01234ABC56789DEF');
  });
  it('Move after cut', () => {
    expect(moveSubstring(hexabeth, 4, 8, 10)).toBe('0123894567ABCDEF');
  });
});

const flattenOutline = (outline, reverse = false) => {
  const next = item => (reverse ? item.prev : item.next);
  const last = arr => arr[arr.length - 1];
  let current = reverse ? last(flattenOutline(outline, false)) : outline[0];
  const flatten = [];
  while (next(current)) {
    flatten.push(current);
    current = next(current);
  }
  flatten.push(current);
  return flatten;
};

describe('generateOutline', () => {
  describe('Empty', () => {
    it('Empty text', () => {
      expect(generateOutline('', () => '<h1></h1>', /.+/)).toEqual([]);
    });
    it('No match regex', () => {
      expect(generateOutline('abc', () => '<h1></h1>', /[0-9]/)).toEqual([]);
    });
  });

  const text = `
  .foo
  ..foobar
  ..foobaz
  .bar
  ..baz
  ...quix
  `;
  const dotOutline = generateOutline(html(text), text);

  describe('dotOutline level1 2x', () => {
    it('2x', () => {
      expect(dotOutline.length).toBe(2);
    });
    it('level1', () => {
      expect(dotOutline.map(h => h.level)).toEqual([1, 1]);
    });
  });
  describe('dotOutline level2 2x in first', () => {
    it('2x', () => {
      expect(dotOutline[0].children.length).toBe(2);
    });
    it('level1', () => {
      expect(dotOutline[0].children.map(h => h.level)).toEqual([2, 2]);
    });
    it('valid path', () => {
      expect(dotOutline[0].path).toEqual([0]);
    });
  });

  describe('next and prev traversal', () => {
    const path = flattenOutline(dotOutline)
      .reduce((acc, val) => acc.concat(val.content), []);
    const revPath = flattenOutline(dotOutline, true)
      .reduce((acc, val) => acc.concat(val.content), []);
    it('Traverse back and forth', () => {
      expect(path).toEqual([...revPath].reverse());
      expect(revPath).toEqual([...path].reverse());
    });
  });

  const text2 = '.x\n...x\n...x\n...x\n...x\n.x\n....x\n....x\n.....x\n.x\n.....x\n....x\n....x\n...x\n...x\n..x\n..x\n.x';
  const dot2Outline = generateOutline(html(text2), text2);
  const traversed = flattenOutline(dot2Outline).reduce((acc, val) => acc.concat(`${'.'.repeat(val.level)}${val.content.trim()}`), []);
  describe('Test full hierarchy with skipping levels', () => {
    it('Traverse and join back to string', () => {
      expect(traversed.join('\n')).toEqual(text2);
    });
  });
});

describe('findNextSibling', () => {
  const text = `
  .a
  ..b
  ..c
  ....d
  ....e
  .f
  .....g
  ....h
  ..i
  ..j
  ..k
  ...l
  ....m
  .n
  `;
  
  const flatOutline = flattenOutline(generateOutline(html(text), text));
  const got = flatOutline.map(h => (
    findNextSibling(h) ? findNextSibling(h).content.trim() : null
  ));
  const expected = ['f', 'c', 'f', 'e', 'f', 'n', 'h', 'i', 'j', 'k', 'n', 'n', 'n', null];
  it('Find correctly next sections', () => {
    expect(got).toEqual(expected);
  });
});


describe('findWordBounds', () => {
  const sentence = 'wubba  lubba dub dub';
  const wubbaResults = _.uniqWith(
    [0, 1, 2, 3, 4].map(i => findWordBounds(sentence, i)),
    _.isEqual,
  );
  it('Wubba bounds match', () => {
    expect(wubbaResults.length).toBe(1);
  });
  it('Wubba matches match wubba', () => {
    expect(sentence.slice(...wubbaResults[0])).toBe('wubba');
  });
  it('Second dub matches second dup (duplicates)', () => {
    expect(findWordBounds(sentence, 17)).toEqual([17, 20]);
  });
  it('Whitespace match matches only ws', () => {
    expect(sentence.slice(...findWordBounds(sentence, 6)).trim()).toBe('');
  });
});
