import _ from 'lodash';

export default (mode) => {
  const fn = _ => _;
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
    _.entries(mode.symbols).map(([key, symbol]) => {
      if (['bold', 'italic'].includes(key)) {
        // inline
        defaultSet.format[key] = string => `${symbol}${string}${symbol}`;
      } else {
        // block
        defaultSet.format[key] = string => string.split('\n').map(s => `${symbol}${s}`).join('\n');
      }
    })
  }

  return _.defaultsDeep(mode, defaultSet);
}