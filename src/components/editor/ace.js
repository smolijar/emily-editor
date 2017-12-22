import _ from 'lodash';
import getCommands from './commands';

module.exports.setAceOptions = (ace, options) => {
  _.toPairs(options).forEach(([component, settings]) => {
    _.toPairs(settings).forEach(([option, value]) => {
      ace[component].setOption(option, value);
    });
  });
};


module.exports.initializeAce = (ace, editor, options) => {
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
  module.exports.setAceOptions(ace, options);
  ace.focus();
};

module.exports.getBlockSelection = ace => _.merge(ace.selection.getRange(), {
  start: { column: 0 },
  // Don't know how many columns on line, Ace handles overflow
  end: { column: Infinity },
});

module.exports.formatAceSelection = (ace, fn, inline = true) => {
  const range = inline ? ace.selection.getRange() : module.exports.getBlockSelection(ace);
  ace.session.replace(
    range,
    fn(ace.session.getTextRange(range)),
  );
};
