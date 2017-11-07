const toggleCmOption = (editor, option) => {
  const to = !editor.state.options[option];
  editor.cm.setOption(option, to);
  editor.setState({
    ...editor.state,
    options: {
      ...editor.state.options,
      [option]: to,
    },
  });
};

const getCommands = editor => ({
  'options.lineNumbers': {
    text: 'Toggle: Line numbers',
    execute: () => toggleCmOption(editor, 'lineNumbers'),
  },
  'options.lineWrapping': {
    text: 'Toggle: Line wrapping',
    execute: () => toggleCmOption(editor, 'lineWrapping'),
  },
  'columns.both': {
    text: 'View: Editor & Preview',
    execute: () => {
      editor.setState({
        ...editor.state,
        columns: {
          ...editor.state.columns,
          preview: true,
          editor: true,
        },
      });
    },
  },
  'columns.editor': {
    text: 'View: Editor',
    execute: () => {
      editor.setState({
        ...editor.state,
        columns: {
          ...editor.state.columns,
          preview: false,
          editor: true,
        },
      });
    },
  },
  'columns.preview': {
    text: 'View: Preview',
    execute: () => {
      editor.setState({
        ...editor.state,
        columns: {
          ...editor.state.columns,
          preview: true,
          editor: false,
        },
      });
    },
  },
  'columns.outline': {
    text: 'Column outline',
    execute: () => {
      editor.setState({
        ...editor.state,
        columns: {
          ...editor.state.columns,
          outline: !editor.state.columns.outline,
        },
      });
    },
  },
  proportionalSizes: {
    text: 'Proportional sizes',
    execute: () => {
      editor.setState({
        ...editor.state,
        proportionalSizes: !editor.state.proportionalSizes,
      });
    },
  },
  fullscreen: {
    text: 'Toggle: Fullscreen',
    execute: editor.toggleFullscreen,
  },
});

export default getCommands;
