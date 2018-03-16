const getReferenceCompletions = getSuggestions =>
  (editor, session, pos, prefix, callback) => {
    const lineStart = session.getLine(pos.row).slice(0, pos.column);
    getSuggestions().forEach((references) => {
      if (lineStart.match(references.prefix)) {
        callback(null, references.refs);
      }
    });
  };

const getFileCompletions = (listFiles, languageMode) =>
  (editor, session, pos, prefix, callback) => {
    const lineStart = session.getLine(pos.row).slice(0, pos.column);
    const pathPrefix = languageMode.getPathPrefix(lineStart);
    if (pathPrefix !== null) {
      callback(null, listFiles(pathPrefix).map(path => ({ value: path, caption: path, meta: 'file' })));
    }
  };

const addCompleters = (aceEditor, getSuggestions, listFiles, languageMode) => {
  const referenceCompleter = {
    getCompletions: getReferenceCompletions(getSuggestions),
  };
  const fileCompleter = {
    getCompletions: getFileCompletions(listFiles, languageMode),
  };
  /* global ace */
  const langTools = ace.require('ace/ext/language_tools');
  langTools.setCompleters([referenceCompleter, fileCompleter]);
  aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
  });
};

export default addCompleters;
