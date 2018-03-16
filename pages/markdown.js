import fetch from 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../components/Layout';
import Editor from '../src/components/Editor';
import markdown from '../src/modes/markdown';

export default class extends React.Component {
  static async getInitialProps({ req }) {
    let uri = '/static/demo.md';
    if (req) {
      uri = `${req.protocol}://${req.get('host')}${uri}`;
    }
    const res = await fetch(uri, {
      method: 'GET',
    });
    const markdownExample = await res.text();
    return {
      markdownExample,
    };
  }

  static propTypes = {
    markdownExample: PropTypes.string.isRequired,
  }

  render() {
    return (
      <Layout>
        <div
          style={{
            width: '1400px',
            height: '750px',
            display: 'flex',
          }}
        >
          <Editor
            content={this.props.markdownExample}
            language={markdown}
            listFiles={() => Promise.resolve(['foo', 'bar', 'baz', 'quix'])}
          />
        </div>
      </Layout>
    );
  }
}
