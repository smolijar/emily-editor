module.exports.ninjasToHtml = html =>
  html.replace(
    module.exports.ninjaRegex,
    '<strong data-line="$1">($1)</strong>',
  );

module.exports.ninjaRegex = /@@@([0-9]+)@@@/g;

module.exports.createNinja = i => `@@@${i + 1}@@@`;
