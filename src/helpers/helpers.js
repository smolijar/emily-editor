// Find nth occurance of needle in haystack
module.exports.nthIndexOf = (haystack, needle, n = 1) => haystack
  .split(needle, n)
  .join(needle)
  .length;

// Find next sibling in LML heading hierarchy
// That first successor with greater or equal level
module.exports.findNextSibling = (heading) => {
  let currentNode = heading.successor;
  while (currentNode && currentNode.level > heading.level) {
    currentNode = currentNode.successor;
  }
  return currentNode;
};

// Find top offset of node, relative to container
// Note that container needs to have position relative or absolute
module.exports.findRelativeOffset = (node, container) => {
  // container must have position absolute or relative
  let currentNode = node;
  const nodes = [];
  while (currentNode && currentNode.offsetParent && currentNode !== container) {
    nodes.push(currentNode);
    currentNode = currentNode.offsetParent;
  }
  return nodes.reduce((acc, v) => acc + v.offsetTop, 0);
};

// Move substring defined by cut indices to pasteIndex in ginven string
module.exports.moveSubstring = (string, cutStartIndex, cutEndIndex, _pasteIndex) => {
  const cutted = string.slice(cutStartIndex, cutEndIndex);
  const holed = [
    string.slice(0, cutStartIndex),
    string.slice(cutEndIndex),
  ].join('');
  let pasteIndex = _pasteIndex;
  if (cutEndIndex <= pasteIndex) {
    pasteIndex -= (cutEndIndex - cutStartIndex);
  }
  return [
    holed.slice(0, pasteIndex),
    cutted,
    holed.slice(pasteIndex),
  ].join('');
};

// Find headers in source code using headerRegex
const findHeaders = (source, toHtml, headerRegex) => {
  const dupIndexMap = {};
  return source.match(headerRegex).map((headerSource, index) => {
    dupIndexMap[headerSource] = (dupIndexMap[headerSource] || 0) + 1;
    const html = toHtml(headerSource);
    const [, level, content] = html.match(/<h([0-9])[^<>]*>(.*)<\/h[0-9]>/);
    return {
      source: headerSource,
      html,
      level: Number(level),
      content,
      index,
      dupIndex: dupIndexMap[headerSource],
    };
  });
};

module.exports.generateOutline = (source, toHtml, headerRegex) => {
  const headers = findHeaders(source, toHtml, headerRegex)
    .map(heading => ({
      ...heading,
      children: [],
      path: [],
      parent: null,
    }));
  headers.forEach((heading, i) => {
    const predecessor = headers[i - 1] || null;
    const successor = headers[i + 1] || null;
    headers[i].predecessor = predecessor;
    headers[i].successor = successor;
  });
  const outline = headers
    .reduce((acc, val) => {
      const last = arr => arr[arr.length - 1] || null;
      const insert = (into, what) => {
        if (into.children.length === 0 || what.level - into.level === 1) {
          if (what.level === into.level) {
            into.parent.children.push(what);
          } else {
            // TODO DRY
            into.children.push({
              ...what,
              parent: into,
              path: [...what.path, into.children.length],
            });
          }
        } else if (into.level < what.level) {
          insert(last(into.children), {
            ...what,
            parent: into,
            path: [...what.path, into.children.length - 1],
          });
        } else {
          // TODO DRY
          into.children.push({
            ...what,
            parent: into,
            path: [...what.path, into.children.length],
          });
        }
      };
      const lastHeading = last(acc);
      const lastLevel = lastHeading ? lastHeading.level : 1;
      if (acc.length === 0 || val.level <= lastLevel) {
        acc.push({ ...val, path: [Math.max(acc.length, 1) - 1] });
      } else {
        insert(lastHeading, { ...val, path: [acc.length - 1] }, acc);
      }
      return acc;
    }, []);
  return outline;
};
