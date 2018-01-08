import React from 'react';
import Asciidoctor from 'asciidoctor.js';

const asciidoctor = Asciidoctor();

const asciidoc = {
  name: 'asciidoc',
  toHtml: src => asciidoctor.convert(src, { attributes: { showtitle: true, icons: 'fonts', imagesdir: 'http://www.methods.co.nz/asciidoc/images/' } }),
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
    `}
    </style>
  ),
  previewClassName: 'markdown-body',
};

export default asciidoc;
