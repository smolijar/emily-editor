import _ from 'lodash';

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
  ace.getSession().selection.on('changeCursor', editor.handleCursorActivity);
  ace.commands.addCommand({
    name: 'command-pallette',
    bindKey: { win: 'Ctrl-Shift-P', mac: 'Command-Shift-P' },
    exec: editor.commandPalette.focus,
  });
  module.exports.setAceOptions(ace, options);
  ace.focus();
};
