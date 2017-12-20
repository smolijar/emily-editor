import React from 'react';
import Layout from '../components/Layout';
import Editor from '../src/components/Editor';
import markdown from '../src/modes/markdown';

export default () => (
  <Layout>
    <h1>Fixed container, fluid editor</h1>
    <h2>Div 400px x 400px</h2>
    <div style={{ width: '400px', height: '400px' }}>
      <Editor content="content" language={markdown} />
    </div>
    <h2>Div 80% x 500px</h2>
    <div style={{ width: '80%', height: '500px' }}>
      <Editor content="content" language={markdown} />
    </div>

    <h1>No container, dimension in props</h1>
    <Editor content="content" language={markdown} width={400} height={400} />

    <h1>Combination (container 80%, prop 400)</h1>
    <div style={{ width: '80%' }}>
      <Editor content="content" language={markdown} height={400} />
    </div>
  </Layout>
);
