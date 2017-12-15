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

module.exports.formatAceSelection = (ace, fn) => {
  ace.session.replace(
    ace.selection.getRange(),
    fn(ace.session.getTextRange(ace.getSelectionRange())),
  );
};
