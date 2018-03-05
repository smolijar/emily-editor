import bootstrap from '../../src/modes/boostrap';

// Dot is a trivial markup language for testing purposes.
//  >  Line starting with dots, closed with newline is
//     a heading (number of dots is level).
//  >  Every other line is a paragraph.
const dot = {
  name: 'dot',
  toHtml: raw => raw.split('\n')
    .map((line) => {
      const matches = line.match(/(\.+)(.+)/);
      if (matches) {
        const [, dots, content] = matches;
        const level = Math.min(6, Math.max(dots.length, 0));
        return `<h${level}>${content}</h${level}>`;
      }
      return `<p>${line}</p>`;
    })
    .join('\n'),
  headerRegex: /(\.+)(.+)\n/g,
};

export default bootstrap(dot);
