import React from 'react';

// Find nth occurance of needle in haystack
module.exports.nthIndexOf = (haystack, needle, n = 1) => haystack
  .split(needle, n)
  .join(needle)
  .length;

// Find next sibling in LML heading hierarchy
// That first next with greater or equal level
module.exports.findNextSibling = (heading) => {
  if (!heading) {
    return null;
  }
  let currentNode = heading.next;
  while (currentNode && currentNode.level > heading.level) {
    currentNode = currentNode.next;
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
  if (typeof document === 'undefined') {
    return [];
  }
  const dupIndexMap = {};
  return (source.match(headerRegex) || [])
    .map((headerSource) => {
      dupIndexMap[headerSource] = (dupIndexMap[headerSource] || 0) + 1;
      const node = document.createElement('div');
      node.innerHTML = toHtml(headerSource);
      return [headerSource, node.querySelector('h1,h2,h3,h4,h5,h6')];
    })
    .filter(([, headerDom]) => headerDom !== null)
    .map(([headerSource, headerDom], index) => {
      const [level, content] = [headerDom.tagName.slice(1), headerDom.textContent];
      return {
        source: headerSource,
        html: headerDom.innerHTML,
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
    const prev = headers[i - 1] || null;
    const next = headers[i + 1] || null;
    headers[i].prev = prev;
    headers[i].next = next;
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


module.exports.findWordBounds = (string, index) => [
  index - string.slice(0, index)
    .split('').reverse().join('')
    .split(/\W/)[0].length,
  index + string.slice(index).split(/\W/)[0].length,
];


module.exports.formatShortcut = ({ win, mac }, plaintext = false) => {
  const binding = (
    typeof navigator !== 'undefined' && navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? mac : win
  ).split('-');
  if (plaintext) {
    return binding.join(' + ');
  }
  return binding.map(key => <kbd>{key}</kbd>).reduce((acc, v) => [acc, ' + ', v]);
};

module.exports.applyOnDom = (htmlString, fn) => {
  if (typeof document !== 'undefined') {
    const htmlDom = document.createElement('div');
    htmlDom.innerHTML = htmlString;
    fn(htmlDom);
    return htmlDom.innerHTML;
  }
  return htmlString;
};
