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
          <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
          <link rel="stylesheet" type="text/css" href="hljs/styles/github.css" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.min.css" />
        </Head>
        <Link href="/">
          <button>Home</button>
        </Link>
        <Link href="/markdown">
          <button>Markdown</button>
        </Link>
        {this.props.children}
      </div>
    );
  }
}


export default Layout;
