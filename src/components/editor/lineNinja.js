
export const ninjaRegex = /@@@([0-9]+)@@@/g;

export const ninjasToHtml = html =>
  html.replace(
    ninjaRegex,
    '<strong data-line="$1">($1)</strong>',
  );

export const createNinja = i => `@@@${i + 1}@@@`;

export const higlightSourceWithNinjas = (source, highlightFn) => {
  return source;
  const matches = source.match(ninjaRegex);
  const highlighted = highlightFn(source.replace(ninjaRegex, ''))
    .split('\n')
    .map((line, i) => line + (matches[i] || ''))
    .join('\n');
  return highlighted;
};
