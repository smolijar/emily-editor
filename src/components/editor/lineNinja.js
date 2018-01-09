module.exports.ninjasToHtml = html =>
  html.replace(
    module.exports.ninjaRegex,
    '<strong data-line="$1">($1)</strong>',
  );

module.exports.ninjaRegex = /@@@([0-9]+)@@@/g;

module.exports.createNinja = i => `@@@${i + 1}@@@`;

module.exports.higlightSourceWithNinjas = (source, highlightFn) => {
  const matches = source.match(module.exports.ninjaRegex);
  const highlighted = highlightFn(source.replace(module.exports.ninjaRegex, ''))
    .split('\n')
    .map((line, i) => line + (matches[i] || ''))
    .join('\n');
  return highlighted;
};
