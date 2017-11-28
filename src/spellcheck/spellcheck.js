const addSpellcheck = (CodeMirror, typo) => {
  CodeMirror.defineMode('spellcheck', (config) => {
    const overlay = {
      token: (stream) => {
        let ch = stream.next();
        let word = '';

        if (!ch.match(/\w/)) {
          return null;
        }

        while (ch != null && ch.match(/\w/)) {
          word += ch;
          ch = stream.next();
        }

        if (typo && !typo.check(word)) {
          return 'spell-error'; // CSS class: cm-spell-error
        }

        return null;
      },
    };

    const mode = CodeMirror.getMode(config, config.backdrop || 'text/plain');

    return CodeMirror.overlayMode(mode, overlay, true);
  });
};

module.exports.addSpellcheck = addSpellcheck;
