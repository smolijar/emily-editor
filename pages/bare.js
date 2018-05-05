import React from 'react';
import Layout from '../components/Layout';
import Editor from '../src/components/Editor';
import generateMode from '../src/modes/generateMode';

const style = {
  width: '600px',
  height: '100px',
  display: 'flex',
};
export default () => (
  <Layout>
    <div>
      <h1>No mode</h1>
      <div style={style}>
        <Editor
          content="Plain text content"
        />
      </div>
      <h1>Custom mode (javascript)</h1>
      <div style={style}>
        <Editor
          content="const foo = bar => baz;"
          language={generateMode('javascript')}
        />
      </div>
      <h1>Custom mode (foo.sh)</h1>
      <div style={style}>
        <Editor
          content="cat $HOME/foo.txt | cowsay"
          language={generateMode('foo.sh')}
        />
      </div>
      <h1>Automode (text.md)</h1>
      <div style={style}>
        <Editor
          content={'# Foo \n\n `hello`'}
          language={generateMode('text.md')}
        />
      </div>
    </div>
  </Layout>
);
