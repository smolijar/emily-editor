import _ from 'lodash';
import getCommands from '../commands';
import addCompleters from './completers';

export const setAceOptions = (ace, options) => {
  _.toPairs(options).forEach(([component, settings]) => {
    _.toPairs(settings).forEach(([option, value]) => {
      ace[component].setOption(option, value);
    });
  });
};

const getModeForPathOrName = input => {
  const modelist = ace.require("ace/ext/modelist");
  const mode = modelist.modesByName[input];
  if (mode) {
    return mode.mode;
  }
  return modelist.getModeForPath(input).mode;
}

export const initializeAce = (aceEditor, emily, options) => {
  aceEditor.setTheme('ace/theme/tomorrow');
  aceEditor.getSession().setMode(getModeForPathOrName(emily.props.language.name));
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
