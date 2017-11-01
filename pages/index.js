import fetch from 'isomorphic-fetch';
import marked from 'marked';
import React from 'react';
import PropTypes from 'prop-types';
import Editor from '../components/Editor';

export default class extends React.Component {
  static async getInitialProps() {
    const res = await fetch('http://localhost:3000/static/demo.md', {
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
