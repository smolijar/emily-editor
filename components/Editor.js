import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import screenfull from 'screenfull';
import CommandPalette from './CommandPalette';
import Outline from './Outline';
import StatusBar from './StatusBar';
import { nthIndexOf, findNextSibling, findRelativeOffset, moveSubstring, generateOutline } from '../helpers/helpers';

const STOPPED_TYPING_TIMEOUT = 300;
const STOPPED_CURSOR_ACTIVITY_TIMEOUT = 300;

class Editor extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    language: PropTypes.shape({
      name: PropTypes.string.isRequired,
      getToHtml: PropTypes.func.isRequired,
      lineSafeInsert: PropTypes.func,
      headerRegex: PropTypes.regex,
      renderJsxStyle: PropTypes.func,
      previewClassName: PropTypes.string,
    }),
    width: PropTypes.number,
    height: PropTypes.number,
  }
  static defaultProps = {
    content: '',
    language: {
      name: 'markdown',
      lineSafeInsert: line => line,
      renderJsxStyle: () => {},
      previewClassName: '',
    },
    width: 500,
    height: 500,
  }
  constructor(props) {
    super(props);
    const defaultCmOptions = {
      scrollbarStyle: null,
      lineWrapping: true,
      lineNumbers: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      foldGutter: true,
      theme: 'material',
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Ctrl-P': 'jumpToLine',
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Q': (cm) => { cm.foldCode(cm.getCursor()); },
      },
      keyMap: 'sublime',
      // TODO fix dynamic change
      height: 500,
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateStateValue = this.updateStateValue.bind(this);
    this.generateHtml = this.generateHtml.bind(this);
    this.handleOutlineClick = this.handleOutlineClick.bind(this);
    this.renderProportianalStyles = this.renderProportianalStyles.bind(this);
    this.handleCommand = this.handleCommand.bind(this);
    this.handleEditorScroll = this.handleEditorScroll.bind(this);
    this.handlePreviewScroll = this.handlePreviewScroll.bind(this);
    this.scrollEditorToLine = this.scrollEditorToLine.bind(this);
    this.scrollPreviewToLine = this.scrollPreviewToLine.bind(this);
    this.handleCursorActivity = this.handleCursorActivity.bind(this);
    this.getVisibleLines = this.getVisibleLines.bind(this);
    this.availableCommands = this.availableCommands.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.handleOutlineOrderChange = this.handleOutlineOrderChange.bind(this);
    this.generateOutline = this.generateOutline.bind(this);
    this.handleStoppedTyping = this.handleStoppedTyping.bind(this);
    this.handleStoppedCursorActivity = this.handleStoppedCursorActivity.bind(this);
    this.updateCursor = this.updateCursor.bind(this);
    const html = this.generateHtml(props.content);
    const raw = props.content;
    this.state = {
      width: props.width,
      height: props.height,
      raw,
      proportionalSizes: true,
      html,
      outline: this.generateOutline(this.props.content),
      newScrollTimer: null,
      stoppedTypingTimer: null,
      stoppedCursorActivityTimer: null,
      columns: {
        editor: true,
        preview: true,
        outline: true,
      },
      lastScrolled: null,
      loc: raw.split('\n').length,
      options: {
        mode: props.language.name,
        ...defaultCmOptions,
      },
      cursorLine: 1,
      cursorCol: 1,
    };
  }
  componentDidMount() {
    /* eslint-disable global-require */
    const codemirror = require('codemirror');
    require('codemirror/mode/markdown/markdown');
    require('codemirror/keymap/sublime');
    require('codemirror/addon/dialog/dialog');
    require('codemirror/addon/search/search');
    require('codemirror/addon/search/searchcursor');
    require('codemirror/addon/search/jump-to-line');
    require('codemirror/addon/edit/matchbrackets');
    require('codemirror/addon/edit/closebrackets');
    require('codemirror/addon/fold/foldcode');
    require('codemirror/addon/fold/foldgutter');
    require('codemirror/addon/fold/markdown-fold');
    /* eslint-enable global-require */
    this.cm = codemirror.fromTextArea(this.textarea, {
      ...this.state.options,
    });
    this.cm.on('change', cm => this.handleChange(cm.getValue()));
    this.cm.on('cursorActivity', () => this.handleCursorActivity());
  }
  getVisibleLines(columnNode, lineSelector, numberSelector = null) {
    const editorScroll = columnNode.scrollTop;
    let firstVisibleLine = null;
    const visibleLines = [...columnNode.querySelectorAll(lineSelector)]
      .map((_, i) => [_, i])
      .filter(([lineNode, i]) => {
        const lineOffsetTop = findRelativeOffset(lineNode, columnNode);
        if (lineOffsetTop >= editorScroll) {
          if (firstVisibleLine === null) {
            firstVisibleLine = i;
            return true;
          }
          return lineOffsetTop <= editorScroll + this.state.height;
        }
        return false;
      })
      // if numberSelector null, use index
      .map(([lineNode, i]) => (numberSelector ? numberSelector(lineNode) : i));
    return visibleLines;
  }
  handleOutlineClick(heading) {
    const inCode = heading.source;
    const value = this.state.raw;
    const pos = nthIndexOf(value, inCode, heading.dupIndex);
    const line = value.substr(0, pos).split('\n').length - 1;
    this.cm.setCursor(line);
    this.cm.focus();
  }
  scrollPreviewToLine(ln) {
    let lineNode = this.previewColumn.querySelector(`strong[data-line="${ln}"]`);
    for (let i = ln; i > 0 && !lineNode; i -= 1) {
      lineNode = this.previewColumn.querySelector(`strong[data-line="${i}"]`);
    }
    this.previewColumn.scrollTop = findRelativeOffset(lineNode, this.previewColumn);
  }
  scrollEditorToLine(ln) {
    const to = this.cm.charCoords({ line: ln - 1, ch: 0 }, 'local').top;
    this.cm.scrollTo(null, to);
  }
  handlePreviewScroll() {
    if (this.state.lastScrolled === 'editor') {
      this.setState({
        ...this.state,
        lastScrolled: null,
      });
      return;
    }
    const [firstVisibleLine] = this.getVisibleLines(this.previewColumn, 'strong[data-line]', node => Number(node.dataset.line));
    this.scrollEditorToLine(firstVisibleLine);
    this.setState({
      ...this.state,
      lastScrolled: 'preview',
    });
  }
  handleEditorScroll(e) {
    if (e.target.scrollTop === 0) {
      // triggered by typing
      return;
    }
    if (this.state.lastScrolled === 'preview') {
      this.setState({
        ...this.state,
        lastScrolled: null,
      });
      return;
    }
    const offset = this.cm.getViewport().from;
    const [firstVisibleLineRelative] = this.getVisibleLines(this.cm.getScrollerElement(), '.CodeMirror-line');
    const firstVisibleLine = firstVisibleLineRelative + offset;
    this.scrollPreviewToLine(firstVisibleLine);
    this.setState({
      ...this.state,
      lastScrolled: 'editor',
    });
  }
  updateStateValue(value) {
    const html = this.generateHtml(value);
    const raw = value;
    this.setState({
      raw,
      html,
      loc: raw.split('\n').length,
      outline: this.generateOutline(raw),
    });
  }
  handleChange(value) {
    if (this.state.stoppedTypingTimer) {
      clearTimeout(this.state.stoppedTypingTimer);
    }
    this.setState({
      ...this.state,
      raw: value,
      stoppedTypingTimer: setTimeout(this.handleStoppedTyping, STOPPED_TYPING_TIMEOUT),
    });
  }
  handleStoppedTyping() {
    this.updateStateValue(this.state.raw);
  }
  handleStoppedCursorActivity() {
    this.updateCursor();
  }
  updateCursor() {
    if (this.cm) {
      const { line, ch } = this.cm.getCursor();
      this.setState({
        ...this.state,
        cursorLine: line + 1,
        cursorCol: ch + 1,
      });
    }
  }
  generateHtml(_raw) {
    const raw = _raw
      .split('\n')
      .map((line, i) => this.props.language.lineSafeInsert(line, `@@@${i + 1}@@@`))
      .join('\n');
    return this.props.language.getToHtml()(raw).replace(/@@@([0-9]+)@@@/g, '<strong data-line="$1">($1)</strong>');
  }
  handleCommand(command) {
    this.availableCommands()[command].execute();
  }
  handleCursorActivity() {
    if (this.state.stoppedCursorActivityTimer) {
      clearTimeout(this.state.stoppedCursorActivityTimer);
    }
    this.setState({
      ...this.state,
      stoppedCursorActivityTimer: setTimeout(
        this.handleStoppedCursorActivity,
        STOPPED_CURSOR_ACTIVITY_TIMEOUT,
      ),
    });
  }
  availableCommands() {
    return {
      'options.lineNumbers': {
        text: 'Toggle: Line numbers',
        execute: () => {
          const to = !this.state.options.lineNumbers;
          this.cm.setOption('lineNumbers', to);
          this.setState({
            ...this.state,
            options: {
              ...this.state.options,
              lineNumbers: to,
              foldGutter: to,
            },
          });
        },
      },
      'options.lineWrapping': {
        text: 'Toggle: Line wrapping',
        execute: () => {
          const to = !this.state.options.lineWrapping;
          this.cm.setOption('lineWrapping', to);
          this.setState({
            ...this.state,
            options: {
              ...this.state.options,
              lineWrapping: to,
            },
          });
        },
      },
      'columns.both': {
        text: 'View: Editor & Preview',
        execute: () => {
          this.setState({
            ...this.state,
            columns: {
              ...this.state.columns,
              preview: true,
              editor: true,
            },
          });
        },
      },
      'columns.editor': {
        text: 'View: Editor',
        execute: () => {
          this.setState({
            ...this.state,
            columns: {
              ...this.state.columns,
              preview: false,
              editor: true,
            },
          });
        },
      },
      'columns.preview': {
        text: 'View: Preview',
        execute: () => {
          this.setState({
            ...this.state,
            columns: {
              ...this.state.columns,
              preview: true,
              editor: false,
            },
          });
        },
      },
      'columns.outline': {
        text: 'Column outline',
        execute: () => {
          this.setState({
            ...this.state,
            columns: {
              ...this.state.columns,
              outline: !this.state.columns.outline,
            },
          });
        },
      },
      proportionalSizes: {
        text: 'Proportional sizes',
        execute: () => {
          this.setState({
            ...this.state,
            proportionalSizes: !this.state.proportionalSizes,
          });
        },
      },
      fullscreen: {
        text: 'Toggle: Fullscreen',
        execute: this.toggleFullscreen,
      },
    };
  }
  toggleFullscreen() {
    screenfull.on('change', () => {
      if (!screenfull.isFullscreen && this.state.fullscreen) {
        this.setState({
          ...this.state,
          fullscreen: false,
        });
      }
    });
    if (this.state.fullscreen) {
      screenfull.exit();
    } else {
      screenfull.request(this.editor);
    }
    this.setState({
      ...this.state,
      fullscreen: !this.state.fullscreen,
    });
  }
  handleOutlineOrderChange(header, { oldIndex, newIndex }) {
    // Do nothing if no distance
    if (oldIndex === newIndex) {
      return;
    }
    // Container in which headers are swapped
    const container = header ? header.children : this.state.outline;
    // Header section to move
    const movingItem = container[oldIndex];
    // Header section to paste before
    let targetItem = container[newIndex];
    if (newIndex > oldIndex) {
      targetItem = findNextSibling(targetItem);
    }
    // Find header section which ends movingItem section
    const nextSibling = findNextSibling(movingItem);

    // Find indicies
    const value = this.state.raw;
    const cutStart = nthIndexOf(value, movingItem.source, movingItem.dupIndex);
    const cutEnd = nthIndexOf(value, nextSibling.source, nextSibling.dupIndex);
    const pasteIndex = nthIndexOf(value, targetItem.source, targetItem.dupIndex);

    // Move the section
    const newValue = moveSubstring(value, cutStart, cutEnd, pasteIndex);

    this.updateStateValue(newValue);
    this.cm.setValue(newValue);
  }
  generateOutline(raw) {
    return generateOutline(
      raw,
      this.props.language.getToHtml(),
      this.props.language.headerRegex,
    );
  }
  renderProportianalStyles() {
    if (this.state.proportionalSizes) {
      return (
        <style jsx global>{`
                .cm-header-1 { font-size: 2em; }
                .cm-header-2 { font-size: 1.5em; }
                .cm-header-3 { font-size: 1.32em; }
                .cm-header-4 { font-size: 1.15em; }
                .cm-header-5 { font-size: 1.07em; }
                .cm-header-6 { font-size: 1.03em; }
            `}
        </style>
      );
    }
    return null;
  }
  render() {
    const commandPaletteOptions = Object.entries(this.availableCommands())
      .reduce((acc, [k, v]) => { acc[k] = v.text; return acc; }, {});
    let markupEditorStyles = {
      display: 'flex',
      width: 'inherit',
      height: 'inherit',
    };
    if (this.state.fullscreen) {
      markupEditorStyles = {
        ...markupEditorStyles,
        width: '100vw',
        height: '100vh',
      };
    }
    return (
      <div className="markup-editor-wrapper">
        <Head>
          <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
          <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
          <link rel="stylesheet" type="text/css" href="markup-editor/theme/material.css" />
          <link rel="stylesheet" type="text/css" href="markup-editor/addon/dialog/dialog.css" />
          <link rel="stylesheet" type="text/css" href="markup-editor/addon/fold/foldgutter.css" />
          <link rel="stylesheet" type="text/css" href="hljs/styles/github.css" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.min.css" />
        </Head>
        <div
          className="markup-editor"
          role="presentation"
          onKeyDown={(e) => {
                        if (e.shiftKey && e.ctrlKey) {
                          switch (e.key) {
                              case 'p':
                              case 'P':
                                  e.preventDefault();
                                  this.commandPalette.focus();
                                  break;
                              default:
                          }
                        }
                    }}
          style={markupEditorStyles}
          ref={(el) => { this.editor = el; }}
        >
          <CommandPalette
            ref={(el) => { this.commandPalette = el; }}
            options={commandPaletteOptions}
            onSelected={this.handleCommand}
            onExit={() => { this.cm.focus(); }}
          />
          <div className="workspace">
            {
                this.state.columns.outline &&
                <div className="column outline">
                  <Outline
                    outline={this.state.outline}
                    onItemClick={this.handleOutlineClick}
                    onOrderChange={this.handleOutlineOrderChange}
                  />
                </div>
            }
            {this.state.columns.editor &&
            <div className="column" onScroll={this.handleEditorScroll} ref={(el) => { this.editorColumn = el; }}>
              <textarea ref={(el) => { this.textarea = el; }} defaultValue={this.state.raw} />
            </div>
            }
            {this.state.columns.preview &&
            <div className="column" onScroll={this.handlePreviewScroll} ref={(el) => { this.previewColumn = el; }}>
              <div
                className={`preview ${this.props.language.previewClassName}`}
                role="presentation"
                spellCheck="false"
                contentEditable
                onKeyPress={(e) => { e.preventDefault(); }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.html }}
              />
            </div>
            }
          </div>
          <StatusBar
            loc={this.state.loc}
            col={this.state.cursorCol}
            line={this.state.cursorLine}
            onCommandPalette={() => this.commandPalette.focus()}
          />
        </div>
        <style jsx global>{`
                  .markup-editor-wrapper {
                    display: flex;
                    height: inherit;
                    width: inherit;
                    align-items: flex-start;
                  }
                  .CodeMirror {
                      font-family: 'Roboto Mono', monospace;
                      // TODO anything higher than editor window
                      height: 2000px;
                      overflow: visible;
                  }
                  .markup-editor {
                      position: relative;
                      border: 3px solid #222;
                      border-bottom: 0;
                      width: auto;
                      height: auto;
                      display: flex;
                      align-items: flex-start;
                      padding-bottom: 20px;
                  }
                  .preview {
                      font-family: 'Roboto', sans-serif;
                      padding: 10px 60px;
                  }
                  .preview:focus {
                      outline: 0px solid transparent;
                  }
                  .preview > div {
                      padding: 0 50px 0 20px;
                  }
                  .preview .cursor {
                      visibility: hidden;
                      display: inline-block;
                      width: 0;
                      height: 0;
                  }
                  .preview *[data-line] {
                      display: inline-flex;
                      visibility: hidden;
                      width: 0;
                      height: 0;
                  }
                  .markup-editor .workspace {
                      align-items: stretch;
                      display: flex;
                      height: inherit;
                      width: inherit;
                      align-items: flex-start;
                  }
                  .markup-editor .workspace > .column {
                      flex: 3;
                      position: relative; // important for scroll synchro!
                      overflow-y: scroll;
                      overflow-x: hidden;
                      height: inherit;
                  }
                  .markup-editor .workspace > .column.outline {
                    flex: 1;
                  }
                  .markup-editor .workspace > .column::-webkit-scrollbar {
                      width: 0;
                      background: transparent;
                  }
                `}
        </style>
        {this.props.language.renderJsxStyle()}
        {this.renderProportianalStyles()}
      </div>
    );
  }
}

export default Editor;
