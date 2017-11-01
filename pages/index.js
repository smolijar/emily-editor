import fetch from 'isomorphic-fetch';
import marked from 'marked';
import React from 'react';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';
import Editor from '../components/Editor';

export default class extends React.Component {
  static async getInitialProps({ req }) {
    let uri = '/static/demo.md';
    if (req) {
      uri = `${req.protocol}://${req.get('host')}${uri}`;
    }
    const res = await fetch(uri, {
      method: 'GET',
    });
    const markdown = await res.text();
    return {
      markdown,
    };
  }

  static propTypes = {
    markdown: PropTypes.string.isRequired,
  }

  render() {
    marked.setOptions({
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
    });
    return (
      <div
        style={{
          width: '1400px',
          height: '750px',
          display: 'flex',
        }}
      >
        <Editor
          content={this.props.markdown}
          language={{
            name: 'markdown',
            toHtml: marked,
            lineSafeInsert: (line, content) => {
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
          }}
          width={1800}
          height={850}
        />
      </div>
    );
  }
}
