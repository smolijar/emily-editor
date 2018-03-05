import _ from 'lodash';
import getCommands from './commands';

export const setAceOptions = (ace, options) => {
  _.toPairs(options).forEach(([component, settings]) => {
    _.toPairs(settings).forEach(([option, value]) => {
      ace[component].setOption(option, value);
    });
  });
};


export const initializeAce = (ace, editor, options) => {
  ace.setTheme('ace/theme/tomorrow');
  ace.getSession().setMode(`ace/mode/${editor.props.language.name}`);
  ace.getSession().on('change', () => {
    editor.handleChange(ace.getValue());
  });
  ace.session.on('changeScrollTop', editor.handleEditorScroll);
  ace.getSession().selection.on('changeCursor', editor.handleCursorActivity);
  _.toPairs(getCommands(editor)).forEach(([name, command]) => {
    ace.commands.addCommand({
      name,
      bindKey: command.bindKey,
      exec: command.execute,
    });
  });
  setAceOptions(ace, options);
  ace.focus();
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
