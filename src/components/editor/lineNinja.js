
export const ninjaRegex = /@@@([0-9]+)@@@/g;

export const ninjasToHtml = html =>
  html.replace(
    ninjaRegex,
    '<strong data-line="$1">($1)</strong>',
  );

export const createNinja = i => `@@@${i + 1}@@@`;

export const ninjaSelector = 'strong[data-line]';

export const addNinjas = (src, insert) => src
  .split('\n')
  .map((line, i) => insert(line, createNinja(i)))
  .join('\n');


export const toHtmlWithNinjas = (src, insert, convert) =>
  ninjasToHtml(convert(addNinjas(src, insert)).html);

export const higlightSourceWithNinjas = (source, highlightFn) => {
  const matches = source.match(ninjaRegex);
  const highlighted = highlightFn(source.replace(ninjaRegex, ''))
    .split('\n')
    .map((line, i) => line + (matches[i] || ''))
    .join('\n');
  return highlighted;
};
