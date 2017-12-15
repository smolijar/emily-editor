import _ from 'lodash';
import { setAceOptions } from './ace';

const setOption = (editor, component, option, value) => {
  editor.setState(_.set(
    { ...editor.state },
    `aceOptions.${component}.${option}`,
    value,
  ));
  setAceOptions(editor.ace, editor.state.aceOptions);
};

const toggleOption = (editor, component, option) => {
  const to = !editor.state.aceOptions[component][option];
  setOption(editor, component, option, to);
};

const ensureEditorOrPreview = (columns) => {
  if (!columns.editor && !columns.preview) {
    return { ...columns, editor: true };
  }
  return columns;
};

const getCommands = editor => ({
  'editor.gutter': {
    text: 'Editor: Toggle gutter (line numbers)',
    execute: () => {
      toggleOption(editor, 'renderer', 'showGutter');
    },
  },
  'editor.wrap': {
    text: 'Editor: Toggle wrap',
    execute: () => {
      toggleOption(editor, 'session', 'wrap');
    },
  },
  'editor.whitespace': {
    text: 'Editor: Toggle whitespace characters',
    execute: () => {
      toggleOption(editor, 'renderer', 'showInvisibles');
    },
  },
  'layout.editor': {
    text: 'Layout: Toggle editor',
    execute: () => {
      editor.setState({
        columns: ensureEditorOrPreview({
          ...editor.state.columns,
          editor: !editor.state.columns.editor,
        }),
      });
    },
  },
  'layout.preview': {
    text: 'Layout: Toggle preview',
    bindKey: { win: 'Ctrl-P', mac: 'Command-P' },
    execute: () => {
      editor.setState({
        columns: ensureEditorOrPreview({
          ...editor.state.columns,
          preview: !editor.state.columns.preview,
        }),
      });
    },
  },
  'layout.outline': {
    text: 'Layout: Toggle outline',
    bindKey: { win: 'Ctrl-O', mac: 'Command-O' },
    execute: () => {
      editor.setState({
        columns: {
          ...editor.state.columns,
          outline: !editor.state.columns.outline,
        },
      });
    },
  },
  'layout.fullscreen': {
    bindKey: { win: 'F11', mac: 'F11' },
    text: 'Toggle: Fullscreen',
    execute: editor.toggleFullscreen,
  },
});

export default getCommands;
