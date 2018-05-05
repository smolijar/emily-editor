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
    </div>
  </Layout>
);
