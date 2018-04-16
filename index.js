const markdown = require('./dist/modes/markdown').default;
const asciidoc = require('./dist/modes/asciidoc').default;
const Emily = require('./dist/components/Editor');

module.exports = Emily;
module.exports.modes = { markdown, asciidoc };
