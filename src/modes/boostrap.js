import _ from 'lodash';

export default (mode) => {
  const fn = x => x;
  // Default required dud properties
  const defaultSet = {
    toHtml: fn,
    postProcess: fn,
    lineSafeInsert: (line, content) => `${line} ${content}`,
    renderJsxStyle: () => {},
    previewClassName: '',
  };

  // Generate properties from symbols in _markdown_ style
  if (mode.symbols) {
    defaultSet.format = {};
    _.entries(mode.symbols).forEach(([key, symbol]) => {
      switch (true) {
        case ['bold', 'italic'].includes(key):
          defaultSet.format[key] = string => `${symbol}${string}${symbol}`;
          break;
        case key === 'header':
          defaultSet.headerRegex = new RegExp(`(\\n|^)(${symbol}+\\s+\\S.*)|(\\S.*\\n(=+|-+))`, 'g');
          break;
        default:
          defaultSet.format[key] = string => string.split('\n').map(s => `${symbol}${s}`).join('\n');
      }
    });
  }

  return _.defaultsDeep(mode, defaultSet);
};
