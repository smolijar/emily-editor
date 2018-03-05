import React from 'react';
import Asciidoctor from 'asciidoctor.js';
import bootstrap from './boostrap';

const asciidoctor = Asciidoctor();

const asciidoc = {
  name: 'asciidoc',
  toHtml: src => asciidoctor.convert(src, { attributes: { showtitle: true, icons: 'fonts@', 'source-highlighter': 'highlightjs@' } }),
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
  // must include newline after
  headerRegex: /((\n|^)=+\s+\S.*\n)|(\S.*\n(===+|---+)\n)/g,
  format: {
    bold: string => `*${string}*`,
    italic: string => `_${string}_`,
    ul: string => string.split('\n').map(s => ` - ${s}`).join('\n'),
    ol: string => string.split('\n').map(s => `. ${s}`).join('\n'),
    quote: string => string.split('\n').map(s => `> ${s}`).join('\n'),
  },
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
