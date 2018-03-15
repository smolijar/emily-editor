import _ from 'lodash';
import getCommands from './commands';

export const setAceOptions = (ace, options) => {
  _.toPairs(options).forEach(([component, settings]) => {
    _.toPairs(settings).forEach(([option, value]) => {
      ace[component].setOption(option, value);
    });
  });
};


const addCompleters = (aceEditor, getSuggegstions, listFiles, languageMode) => {
  const referenceCompleter = {
    getCompletions(editor, session, pos, prefix, callback) {
      const lineStart = session.getLine(pos.row).slice(0, pos.column);
      getSuggegstions().forEach((references) => {
        if (lineStart.match(references.prefix)) {
          callback(null, references.refs);
        }
      });
    },
  };
  const fileCompleter = {
    getCompletions(editor, session, pos, prefix, callback) {
      const lineStart = session.getLine(pos.row).slice(0, pos.column);
      const pathPrefix = languageMode.getPathPrefix(lineStart);
      if (pathPrefix !== null) {
        callback(null, listFiles(pathPrefix).map(path => ({ value: path, caption: path, meta: 'file' })));
      }
    },
  };
  /* global ace */
  const langTools = ace.require('ace/ext/language_tools');
  langTools.setCompleters([referenceCompleter, fileCompleter]);
  aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
  });
};

export const initializeAce = (aceEditor, emily, options) => {
  aceEditor.setTheme('ace/theme/tomorrow');
  aceEditor.getSession().setMode(`ace/mode/${emily.props.language.name}`);
  aceEditor.getSession().on('change', () => {
    emily.handleChange(aceEditor.getValue());
  });
  aceEditor.session.on('changeScrollTop', emily.handleEditorScroll);
  aceEditor.getSession().selection.on('changeCursor', emily.handleCursorActivity);
  _.toPairs(getCommands(emily)).forEach(([name, command]) => {
    aceEditor.commands.addCommand({
      name,
      bindKey: command.bindKey,
      exec: command.execute,
    });
  });
  setAceOptions(aceEditor, options);
  const { listFiles, language } = emily.props;
  addCompleters(aceEditor, () => emily.state.suggestions, listFiles, language);

  aceEditor.focus();
};

export const getBlockSelection = ace => _.merge(ace.selection.getRange(), {
  start: { column: 0 },
  // Don't know how many columns on line, Ace handles overflow
  end: { column: Infinity },
});

export const formatAceSelection = (ace, fn, inline = true) => {
  const range = inline ? ace.selection.getRange() : getBlockSelection(ace);
  ace.session.replace(
    range,
    fn(ace.session.getTextRange(range)),
  );
};
