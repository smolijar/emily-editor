const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextapp = next({ dev });
const handle = nextapp.getRequestHandler();
const port = process.env.PORT || 3000;

nextapp.prepare()
  .then(() => {
    const app = express();
    app.use('/markup-editor', express.static(`${__dirname}/node_modules/codemirror`));
    app.use('/hljs', express.static(`${__dirname}/node_modules/highlight.js`));

    app.get('*', (req, res) => handle(req, res));

    app.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on port ${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
