const markdown = require('./src/modes/markdown');
const asciidoc = require('./src/modes/asciidoc');
const Emily = require('./src/components/Editor');

module.exports = Emily;
module.exports.modes = { markdown, asciidoc };
