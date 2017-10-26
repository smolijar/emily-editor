import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import CodeMirror from 'react-codemirror';
import screenfull from 'screenfull';
import CommandPalette from './CommandPalette';
import Outline, { generateOutline } from './Outline';
import StatusBar from './StatusBar';

// Shame, SSR avoid hack
if (typeof navigator !== 'undefined') {
  /* eslint-disable global-require */
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
}

function findRelativeOffset(node, container) {
  // container must have position absolute or relative
  let currentNode = node;
  const nodes = [];
  while (currentNode && currentNode.offsetParent && currentNode !== container) {
    nodes.push(currentNode);
    currentNode = currentNode.offsetParent;
  }
  return nodes.reduce((acc, v) => acc + v.offsetTop, 0);
}

const SCROLL_TIMEOUT = 5;


class Editor extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    language: PropTypes.shape({
      name: PropTypes.string,
      toHtml: PropTypes.func,
      lineSafeInsert: PropTypes.func,
      headerRegex: PropTypes.regex,
    }),
    width: PropTypes.number,
    height: PropTypes.number,
  }
  static defaultProps = {
    content: '',
    language: {
      name: 'markdown',
      toHtml: src => src,
      lineSafeInsert: line => line,
    },
    width: 500,
    height: 500,
  }
  constructor(props) {
    super(props);
    const defaultCmOptions = {
      scrollbarStyle: null,
      lineWrapping: true,
      lineNumbers: true,
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
    };
    this.handleChange = this.handleChange.bind(this);
    this.generateHtml = this.generateHtml.bind(this);
    this.handleOutlineClick = this.handleOutlineClick.bind(this);
    this.renderProportianalStyles = this.renderProportianalStyles.bind(this);
    this.handleCommand = this.handleCommand.bind(this);
    this.handleEditorScroll = this.handleEditorScroll.bind(this);
    this.handlePreviewScroll = this.handlePreviewScroll.bind(this);
    this.handleCursorActivity = this.handleCursorActivity.bind(this);
    this.getVisibleLines = this.getVisibleLines.bind(this);
    this.availableCommands = this.availableCommands.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    const html = this.generateHtml(props.content);
    const raw = props.content;
    this.state = {
      width: props.width,
      height: props.height,
      raw,
      proportionalSizes: true,
      html,
      outline: generateOutline(
        this.props.content,
        this.props.language.toHtml,
        this.props.language.headerRegex,
      ),
      newScrollTimer: null,
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
    const nthIndexOf = (haystack, needle, n) => haystack.split(needle, n).join(needle).length;
    const inCode = heading.source;
    const cm = this.cmr.getCodeMirror();
    const value = this.state.raw;
    const pos = nthIndexOf(value, inCode, heading.dupIndex);
    const line = value.substr(0, pos).split('\n').length - 1;
    cm.setCursor(line);
    this.cmr.focus();
  }
  handlePreviewScroll() {
    if (this.state.lastScrolled === 'editor') {
      this.setState({ ...this.state, lastScrolled: null });
      return;
    }
    function scrollEditor() {
      const [firstLine] = this.getVisibleLines(this.previewColumn, '[data-line]', (lineNode => Number(lineNode.dataset.line)));
      const lineHelperNode = [...this.editorColumn.querySelectorAll('.CodeMirror-line')][firstLine - 1].parentElement;
      const offset = lineHelperNode ? lineHelperNode.offsetTop : 0;
      this.editorColumn.scrollTop = offset;
      this.setState({ ...this.state, newScrollTimer: null });
    }
    if (this.state.newScrollTimer) {
      clearTimeout(this.state.newScrollTimer);
    }
    this.setState({
      ...this.state,
      newScrollTimer: setTimeout(scrollEditor.bind(this), SCROLL_TIMEOUT),
      lastScrolled: 'preview',
    });
  }
  handleEditorScroll() {
    if (this.state.lastScrolled === 'preview') {
      this.setState({ ...this.state, lastScrolled: null });
      return;
    }
    function scrollPreview() {
      const [firstLine] = this.getVisibleLines(this.editorColumn, '.CodeMirror-line');
      let lineHelperNode = null;
      let currentLine = firstLine;
      while (lineHelperNode === null && currentLine > 0) {
        lineHelperNode = document.querySelector(`.preview strong[data-line="${currentLine}"]`);
        currentLine -= 1;
      }
      const offset = findRelativeOffset(lineHelperNode, this.previewColumn);
      this.previewColumn.scrollTop = offset;
      this.setState({ ...this.state, newScrollTimer: null });
    }
    if (this.state.newScrollTimer) {
      clearTimeout(this.state.newScrollTimer);
    }
    this.setState({
      ...this.state,
      newScrollTimer: setTimeout(scrollPreview.bind(this), SCROLL_TIMEOUT),
      lastScrolled: 'editor',
    });
  }
  handleChange(value) {
    const html = this.generateHtml(value);
    const raw = value;
    this.setState({
      raw,
      html,
      loc: raw.split('\n').length,
      outline: generateOutline(value, this.props.language.toHtml, this.props.language.headerRegex),
    });
  }
  generateHtml(_raw) {
    const raw = _raw
      .split('\n')
      .map((line, i) => this.props.language.lineSafeInsert(line, `@@@${i + 1}@@@`))
      .join('\n');
    return this.props.language.toHtml(raw).replace(/@@@([0-9]+)@@@/g, '<strong data-line="$1">($1)</strong>');
  }
  handleCommand(command) {
    this.availableCommands()[command].execute();
  }
  handleCursorActivity() {
    if (this.cmr) {
      const { line, ch } = this.cmr.getCodeMirror().getCursor();
      console.log(this.cmr.getCodeMirror().getCursor());
      this.setState({
        ...this.state,
        cursorLine: line + 1,
        cursorCol: ch + 1,
      });
    }
  }
  availableCommands() {
    return {
      'options.lineNumbers': {
        text: 'Toggle: Line numbers',
        execute: () => {
          const to = !this.state.options.lineNumbers;
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
          this.setState({
            ...this.state,
            options: {
              ...this.state.options,
              lineWrapping: !this.state.options.lineWrapping,
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
            onExit={() => { this.cmr.focus(); }}
          />
          <div className="workspace">
            {
                this.state.columns.outline &&
                <div className="column outline">
                  <Outline outline={this.state.outline} onItemClick={this.handleOutlineClick} />
                </div>
            }
            {this.state.columns.editor &&
            <div className="column" onScroll={this.handleEditorScroll} ref={(el) => { this.editorColumn = el; }}>
              <CodeMirror
                ref={(el) => { this.cmr = el; }}
                onCursorActivity={this.handleCursorActivity}
                value={this.state.raw}
                onChange={this.handleChange}
                options={this.state.options}
              />
            </div>
            }
            {this.state.columns.preview &&
            <div className="column" onScroll={this.handlePreviewScroll} ref={(el) => { this.previewColumn = el; }}>
              <div
                className="preview"
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
                      height: auto;
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
        {this.renderProportianalStyles()}
      </div>
    );
  }
}

export default Editor;
