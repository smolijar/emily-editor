import fetch from 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../components/Layout';
import Editor from '../src/components/Editor';
import asciidoc from '../src/modes/asciidoc';

export default class extends React.Component {
  static async getInitialProps({ req }) {
    let uri = '/static/demo.adoc';
    if (req) {
      uri = `${req.protocol}://${req.get('host')}${uri}`;
    }
    const res = await fetch(uri, {
      method: 'GET',
    });
    const adocExample = await res.text();
    return {
      adocExample,
    };
  }

  static propTypes = {
    adocExample: PropTypes.string.isRequired,
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
            content={this.props.adocExample}
            language={asciidoc}
          />
        </div>
      </Layout>
    );
  }
}
