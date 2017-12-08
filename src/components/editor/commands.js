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

const getCommands = editor => ({
  'options.lineNumbers': {
    text: 'Toggle: Line numbers',
    execute: () => {
      const to = !editor.state.aceOptions.renderer.showGutter;
      setOption(editor, 'renderer', 'showGutter', to);
    },
  },
  'options.lineWrapping': {
    text: 'Toggle: Line wrapping',
    execute: () => {
      const to = !editor.state.aceOptions.session.wrap;
      setOption(editor, 'session', 'wrap', to);
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
