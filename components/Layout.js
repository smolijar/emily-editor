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
          <script src="dist/script.js" />
          <link rel="stylesheet" type="text/css" href="dist/style.css" />
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
        <Link href="/bare">
          <button>Bare mode</button>
        </Link>
        {this.props.children}
      </div>
    );
  }
}


export default Layout;
