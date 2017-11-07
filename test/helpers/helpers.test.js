import helpers from '../../src/helpers/helpers';

describe('nthIndexOf', () => {
  const hexabeth = '0123456789ABCDEF';
  it(`${hexabeth} find first`, () => {
    expect(helpers.nthIndexOf(hexabeth, '5', 1)).toBe(5);
  });
  it(`${hexabeth} find default (expect first)`, () => {
    expect(helpers.nthIndexOf(hexabeth, 'A')).toBe(10);
  });

  const roses = 'Roses are red, violets are blue, suger is sweet and so are you.';
  it('Poems everybody! First', () => {
    expect(helpers.nthIndexOf(roses, 'are')).toBe(roses.indexOf('are'));
  });
  it('Poems everybody! Third', () => {
    expect(helpers.nthIndexOf(roses, 'are', 3)).toBe(55);
  });
});


describe('moveSubstring', () => {
  const hexabeth = '0123456789ABCDEF';
  it('Move to beginnig', () => {
    expect(helpers.moveSubstring(hexabeth, 10, 16, 0)).toBe('ABCDEF0123456789');
  });
  it('Move before cut', () => {
    expect(helpers.moveSubstring(hexabeth, 10, 13, 5)).toBe('01234ABC56789DEF');
  });
  it('Move after cut', () => {
    expect(helpers.moveSubstring(hexabeth, 4, 8, 10)).toBe('0123894567ABCDEF');
  });
});


describe('generateOutline', () => {
  const flattenOutline = (outline, reverse = false) => {
    const next = item => (reverse ? item.prev : item.next);
    let current = outline[0];
    if (reverse) {
      const flattened = flattenOutline(outline, false);
      current = flattened[flattened.length - 1];
    }
    const flatten = [];
    while (next(current)) {
      flatten.push(current);
      current = next(current);
    }
    flatten.push(current);
    return flatten;
  };

  const text = 'Break yo neck,\n yll interdum yll volutpat tellus.\nUt nizzle adipiscing lorem. Donizzle\ncool break yo neck, yall.';
  const regex = /y\w*/g;
  const toHtml = (yo) => {
    const level = yo.length - 1;
    return `<h${level}>${yo}</h${level}>`;
  };
  const yoOutline = helpers.generateOutline(text, toHtml, regex);

  describe('Yo level1 2x', () => {
    it('2x', () => {
      expect(yoOutline.length).toBe(2);
    });
    it('level1', () => {
      expect(yoOutline.map(h => h.level)).toEqual([1, 1]);
    });
  });
  describe('Yall level2 2x in first', () => {
    it('2x', () => {
      expect(yoOutline[0].children.length).toBe(2);
    });
    it('level1', () => {
      expect(yoOutline[0].children.map(h => h.level)).toEqual([2, 2]);
    });
    it('valid path', () => {
      expect(yoOutline[0].path).toEqual([0]);
    });
  });

  describe('next and prev traversal', () => {
    const path = flattenOutline(yoOutline)
      .concat(flattenOutline(yoOutline, true))
      .reduce((acc, val) => acc.concat(val.content), []);
    it('Traverse back and forth', () => {
      expect(path).toEqual(text.match(regex).concat(text.match(regex).reverse()));
    });
  });
  const text2 = 'y yyy yyy yyy yyy y yyyy yyyy yyyyy y yyyyy yyyy yyyy yyy yyy yy yy y';
  const yOutline = helpers.generateOutline(text2, toHtml, regex);
  const traversed = flattenOutline(yOutline).reduce((acc, val) => acc.concat(val.content), []);
  describe('Test full hierarchy with skipping levels', () => {
    it('Traverse and join back to string', () => {
      expect(traversed.join(' ')).toEqual(text2);
    });
  });
});
