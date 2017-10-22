const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextapp = next({ dev });
const handle = nextapp.getRequestHandler();

nextapp.prepare()
  .then(() => {
    const app = express();
    app.use('/markup-editor', express.static(`${__dirname}/node_modules/codemirror`));

    app.get('*', (req, res) => handle(req, res));

    app.listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
