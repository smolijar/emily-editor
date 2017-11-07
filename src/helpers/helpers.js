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
    }));
  headers.forEach((heading, i) => {
    const predecessor = headers[i - 1] || null;
    const successor = headers[i + 1] || null;
    headers[i].predecessor = predecessor;
    headers[i].successor = successor;
  });
  const outline = headers
    .reduce((acc, _val) => {
      const val = _val;
      function insert(into, what, ac) {
        if (into.children.length === 0 || what.level - into.level === 1) {
          what.path.push(into.children.length);
          into.children.push(what);
        } else if (into.level < what.level) {
          what.path.push(into.children.length - 1);
          insert(into.children[into.children.length - 1], what, ac);
        } else {
          let anotherInto = ac[what.path[0]];
          what.path.slice(1, what.path.length - 1).forEach((i) => {
            anotherInto = anotherInto.children[i];
          });
          anotherInto.children.push(what);
        }
      }
      if (acc.length === 0) {
        acc.push({ ...val, path: [0] });
      } else {
        const lastHeading = acc[acc.length - 1];
        const lastLevel = lastHeading.level;
        if (val.level <= lastLevel) {
          acc.push({ ...val, path: [acc.length - 1] });
        } else {
          val.path = [acc.length - 1];
          insert(acc[acc.length - 1], val, acc);
        }
      }
      return acc;
    }, []);
  return outline;
};
