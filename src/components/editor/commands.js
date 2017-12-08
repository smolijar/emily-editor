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

const getCommands = editor => ({
  'options.gutter': {
    text: 'Toggle: Line numbers',
    execute: () => {
      toggleOption(editor, 'renderer', 'showGutter');
    },
  },
  'options.wrap': {
    text: 'Toggle: Line wrapping',
    execute: () => {
      toggleOption(editor, 'session', 'wrap');
    },
  },
  'options.whitespace': {
    text: 'Toggle: Whitespace characters',
    execute: () => {
      toggleOption(editor, 'renderer', 'showInvisibles');
    },
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
