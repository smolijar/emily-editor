import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';

import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';

import twemoji from 'twemoji';

const mdOptions = {
  linkify: true,
  typographer: true,
  highlight: (code) => {
    const matches = code.match(/@@@([0-9]+)@@@/g);
    const highlighted = hljs
      .highlightAuto(code.replace(/@@@([0-9]+)@@@/g, ''))
      .value
      .split('\n')
      .map((line, i) => line + (matches[i] || ''))
      .join('\n');
    return highlighted;
  },
};

const md = MarkdownIt(mdOptions);
md.use(emoji);
md.use(sub);
md.use(sup);
md.use(footnote);
md.use(deflist);
md.use(abbr);
md.use(ins);
md.use(mark);
md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);

const markdown = {
  name: 'markdown',
  getToHtml: () => {
    // eslint-disable-next-line react/jsx-no-bind
    const renderer = md.render.bind(md);
    return renderer;
  },
  lineSafeInsert: (line, content) => {
    // Skip code block start / end (~~~,---)
    // Skip footnotes ([^...])
    // Skip abbreviations (*[...])
    if (line.match(/(```|~~~|\[\^|\*\[)/)) {
      return line;
    }
    // if contains link, insert not to break href
    if (line.match(/.*\[.*\]\s*\(.*\).*/)) {
      const segments = line.split(')');
      segments[segments.length - 1] += content;
      return segments.join(')');
    }
    // else append to any word
    return line.replace(/(.*)(\w)(.*)/, `$1$2${content}$3`);
  },
  // must include newline after
  headerRegex: /(#+\s+\S.*\n)|(\S.*\n(===+|---+)\n)/g,
};

export default markdown;
