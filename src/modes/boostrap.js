import _ from 'lodash';

export default (mode) => {
  const fn = _ => _;
  const defaultSet = {
    toHtml: fn,
    postProcess: fn,
    lineSafeInsert: (line, content) => `${line} ${content}`,
    renderJsxStyle: () => {},
    previewClassName: '',
  };

  return _.merge(defaultSet, mode);
}