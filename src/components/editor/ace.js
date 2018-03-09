import _ from 'lodash';
import getCommands from './commands';

export const setAceOptions = (ace, options) => {
  _.toPairs(options).forEach(([component, settings]) => {
    _.toPairs(settings).forEach(([option, value]) => {
      ace[component].setOption(option, value);
    });
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
