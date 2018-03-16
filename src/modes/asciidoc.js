const React = require('react');
const Asciidoctor = require('asciidoctor.js');
const bootstrap = require('./boostrap');

const asciidoctor = Asciidoctor();
require('asciidoctor-html5s');

const options = {
  attributes: {
    showtitle: true,
    icons: 'fonts@',
    'source-highlighter': 'highlightjs@',
  },
  backend: 'html5s',
};

const fetchReferences = (adocDoc, transformValue = null) => adocDoc.$references().$fetch('ids').$to_a().map(([key, content]) => {
  const caption = content.replace(/<[^>]*>?/g, '');
  return {
    value: transformValue ? transformValue(key, caption) : key,
    caption,
    meta: 'reference',
  };
});

const fetchVariables = adocDoc => adocDoc.attributes_modified.$to_a().map(value => ({ value, caption: value, meta: 'variable' }));

const convert = (src, srcOriginal = null) => {
  const doc = asciidoctor.load(srcOriginal || src, options);
  const suggestions = [
    {
      // <<>> references
      prefix: /<<[a-zA-Z0-9_]*$/,
      refs: fetchReferences(doc, (key, caption) => `${key}, ${caption}`),
    },
    {
      // xref references
      prefix: /xref:[a-zA-Z0-9_]*$/,
      refs: fetchReferences(doc),
    },
    {
      // variables
      prefix: /{[a-zA-Z0-9_]*$/,
      refs: fetchVariables(doc),
    },
  ];
  return { html: asciidoctor.convert(src, options), suggestions };
};


const asciidoc = {
  name: 'asciidoc',
  convert,
  postProcess: (domNode) => {
    domNode.querySelectorAll('.toc strong').forEach(e => e.parentNode.removeChild(e));
    return domNode;
  },
  lineSafeInsert: (line, content) => {
    // If line does not contain words, it is
    // most likely not going to render into
    // anything. Prevent messing up table
    // markup etc.
    if (!line.match(/\w/)) {
      return line;
    }
    // Skip probable variable definitions
    // Skip code block start / end (~~~,```,----)
    // Skip source, img, etc. annotation ^[...]$
    if (line.match(/(^:.*:.*$|```|~~~|----|^\[.*\]\s*$)/)) {
      return line;
    }
    // Do not break source code numbers `// <1>`
    if (line.match(/(\/\/\s*<[0-9]+>\s*$)/)) {
      return line.replace(/(.*)(\/\/\s*<[0-9]+>\s*$)/, `$1 ${content} $2`);
    }
    // else append to any word
    return line.replace(/(.*)(\w)(.*)/, `$1$2${content}$3`);
  },
  symbols: {
    bold: '*',
    italic: '_',
    ul: ' - ',
    ol: '. ',
    quote: '> ',
  },
  getPathPrefix: (lineStart) => {
    if (lineStart.match(/(include|image|link)::\S*$/)) {
      return lineStart.split('::').slice(-1)[0];
    }
    if (lineStart.match(/(link):\S*$/)) {
      return lineStart.split(':').slice(-1)[0];
    }
    return null;
  },
  excludeNode: $node => $node.hasClass('discrete'),
  renderJsxStyle: () => (
    <style jsx global>{`
      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
      .admonitionblock td.icon [class^="fa icon-"]{font-size:2.5em;text-shadow:1px 1px 2px rgba(0,0,0,.5);cursor:default;font-style: normal;}
      .admonitionblock td.icon .icon-note:before{content:"\f05a";color:#19407c}
      .admonitionblock td.icon .icon-tip:before{content:"\f0eb";text-shadow:1px 1px 2px rgba(155,155,0,.8);color:#111}
      .admonitionblock td.icon .icon-warning:before{content:"\f071";color:#bf6900}
      .admonitionblock td.icon .icon-caution:before{content:"\f06d";color:#bf3400}
      .admonitionblock td.icon .icon-important:before{content:"\f06a";color:#bf0000}
      .conum[data-value]{display:inline-block;color:#fff!important;background-color:rgba(0,0,0,.8);-webkit-border-radius:100px;border-radius:100px;text-align:center;font-size:.75em;width:1.67em;height:1.67em;line-height:1.67em;font-family:"Open Sans","DejaVu Sans",sans-serif;font-style:normal;font-weight:bold}
      .conum[data-value] *{color:#fff!important}
      .conum[data-value]+b{display:none}
      .conum[data-value]:after{content:attr(data-value)}
      pre .conum[data-value]{position:relative;top:-.125em}
      b.conum *{color:inherit!important}
      .conum:not([data-value]):empty{display:none}
    `}
    </style>
  ),
  previewClassName: 'markdown-body',
};

export default bootstrap(asciidoc);
