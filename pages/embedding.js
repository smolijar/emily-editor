import React from 'react';
import Layout from '../components/Layout';
import Editor from '../src/components/Editor';
import markdown from '../src/modes/markdown';

export default () => (
  <Layout>
    <h1>Embedding</h1>
    <h1>Div 400px x 400px</h1>
    <div
      style={{
        width: '400px',
        height: '400px',
      }}
    >
      <Editor
        content="content"
        language={markdown}
      />
    </div>
    <h1>Div 80% x 500px</h1>
    <div
      style={{
        width: '80%',
        height: '500px',
      }}
    >
      <Editor
        content="content"
        language={markdown}
      />
    </div>
  </Layout>
);
