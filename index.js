const markdown = require('./dist/modes/markdown').default;
const asciidoc = require('./dist/modes/asciidoc').default;
const generateMode = require('./dist/modes/generateMode');
const Emily = require('./dist/components/Editor');

module.exports = Emily;
module.exports.modes = { markdown, asciidoc };
module.exports.generateMode = generateMode;
