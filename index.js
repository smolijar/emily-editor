const markdown = require('./dist/modes/markdown');
const asciidoc = require('./dist/modes/asciidoc');
const Emily = require('./dist/components/Editor');

module.exports = Emily;
module.exports.modes = { markdown, asciidoc };
