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


describe('findHeaders', () => {
  const text = 'Break yo neck,\n yll interdum yll volutpat tellus.\nUt nizzle adipiscing lorem. Donizzle\ncool break yo neck, yall.';
  const regex = /y\w*/g;
  const toHtml = (yo) => {
    const level = yo.length - 1;
    return `<h${level}>${yo}</h${level}>`;
  };
  const outline = helpers.generateOutline(text, toHtml, regex);

  describe('Yo level1 2x', () => {
    it('2x', () => {
      expect(outline.length).toBe(2);
    });
    it('level1', () => {
      expect(outline.map(h => h.level)).toEqual([1, 1]);
    });
  });
  describe('Yall level2 2x in first', () => {
    it('2x', () => {
      expect(outline[0].children.length).toBe(2);
    });
    it('level1', () => {
      expect(outline[0].children.map(h => h.level)).toEqual([2, 2]);
    });
    it('valid path', () => {
      expect(outline[0].path).toEqual([0]);
    });
  });

  describe('Successor and predecessor traversal', () => {
    let current = outline[0];
    const path = [];
    while (current.successor) {
      path.push(current.content);
      current = current.successor;
    }
    path.push(current.content);
    while (current.predecessor) {
      path.push(current.content);
      current = current.predecessor;
    }
    path.push(current.content);
    it('Traverse back and forth', () => {
      expect(path).toEqual(text.match(regex).concat(text.match(regex).reverse()));
    });
  });
  const text2 = 'y yy yy yyy yyy yyyy yyyy yyyyy y yyyyy yyyy yyyy yyy yyy yy yy y';
  const outline2 = helpers.generateOutline(text2, toHtml, regex);
  const traversed = [];
  let cur = outline2[0];
  while (cur.successor) {
    traversed.push(cur.content);
    cur = cur.successor;
  }
  traversed.push(cur.content);

  describe('Test full hierarchy', () => {
    it('Traverse', () => {
      expect(traversed.join(' ')).toEqual(text2);
    });
  });
});
