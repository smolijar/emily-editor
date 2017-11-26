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
          {
            [
              'markup-editor/lib/codemirror.js',
              'markup-editor/mode/markdown/markdown.js',
              'markup-editor/keymap/sublime.js',
              'markup-editor/addon/dialog/dialog.js',
              'markup-editor/addon/search/search.js',
              'markup-editor/addon/search/searchcursor.js',
              'markup-editor/addon/search/jump-to-line.js',
              'markup-editor/addon/edit/matchbrackets.js',
              'markup-editor/addon/edit/closebrackets.js',
              'markup-editor/addon/fold/foldcode.js',
              'markup-editor/addon/fold/foldgutter.js',
              'markup-editor/addon/fold/markdown-fold.js',
            ]
              .map(path => (
                <script src={path} />
              ))
          }
          <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
          <link rel="stylesheet" type="text/css" href="markup-editor/theme/material.css" />
          <link rel="stylesheet" type="text/css" href="markup-editor/addon/dialog/dialog.css" />
          <link rel="stylesheet" type="text/css" href="markup-editor/addon/fold/foldgutter.css" />
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
