import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import PropTypes from 'prop-types';

class Layout extends React.PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }
  static defaultProps = {
    children: [],
  }
  render() {
    return (
      <div>
        <Head>
          <script src="ace/src-min/ace.js" />
          <script src="ace/src-min/ext-language_tools.js" />
          <link rel="stylesheet" type="text/css" href="hljs/styles/github.css" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.min.css" />
          <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
        </Head>
        <Link href="/">
          <button>Home</button>
        </Link>
        <Link href="/markdown">
          <button>Markdown</button>
        </Link>
        <Link href="/asciidoc">
          <button>Asciidoc</button>
        </Link>
        <Link href="/embedding">
          <button>Embed</button>
        </Link>
        {this.props.children}
      </div>
    );
  }
}


export default Layout;
