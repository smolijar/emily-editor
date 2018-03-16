import React from 'react';
import PropTypes from 'prop-types';
import screenfull from 'screenfull';
import CommandPalette from './CommandPalette';
import Outline from './Outline';
import StatusBar from './StatusBar';
import { toHtmlWithNinjas } from './editor/lineNinja';
import { autosaveStore, autosaveRetrieve } from './editor/autosave';
import getCommands from './editor/commands';
import { findNextSibling, findRelativeOffset, moveSubstring, generateOutline, applyOnDom } from '../helpers/helpers';
import { initializeAce } from './editor/ace';

const STOPPED_TYPING_TIMEOUT = 300;
const STOPPED_CURSOR_ACTIVITY_TIMEOUT = 300;

export default class EmilyEditor extends React.PureComponent {
  static propTypes = {
    content: PropTypes.string,
    language: PropTypes.shape({
      name: PropTypes.string.isRequired,
      convert: PropTypes.func.isRequired,
      lineSafeInsert: PropTypes.func.isRequired,
      postProcess: PropTypes.func.isRequired,
      renderJsxStyle: PropTypes.func.isRequired,
      excludeNode: PropTypes.func.isRequired,
      previewClassName: PropTypes.string.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    listFiles: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
  }
  static defaultProps = {
    content: '',
    listFiles: (pfx) => {
      const files = ['foo', 'bar', 'baz', 'quix'];
      console.log([pfx, files]);
      return Promise.resolve(files);
    },
    width: null,
    height: null,
  }
  constructor(props) {
    super(props);

    const defaultAceOptions = {
      renderer: {
        showGutter: false,
        showInvisibles: false,
      },
      session: {
        wrap: true,
      },
    };

    const { html, suggestions } = this.generateHtml(props.content);
    const raw = props.content;
    this.state = {
      raw,
      html,
      outline: generateOutline(html, raw, this.props.language.excludeNode),
      proportionalSizes: true,
      columns: {
        editor: true,
        preview: true,
        outline: true,
      },
      // eslint-disable-next-line react/no-unused-state
      suggestions,
      aceOptions: defaultAceOptions,
      autosaved: null,
      loc: raw.split('\n').length,
      cursorLine: 1,
      cursorCol: 1,
    };
    this.lastScrolled = null;
    this.stoppedTypingTimer = null;
    this.stoppedCursorActivityTimer = null;
  }
  componentDidMount() {
    if (typeof ace !== 'undefined' && ace) {
      /* global ace */
      this.ace = ace.edit(this.textarea);
      initializeAce(this.ace, this, this.state.aceOptions);
    } else if (process.env.NODE_ENV !== 'test') {
      console.error('Ace is not defined. Forgot to include script?');
    }
    this.autosaveRetrieve();
  }
  getValue = () => this.state.raw;
  getPreviewFirstVisibleLine = () => {
    const editorScroll = this.previewColumn.scrollTop;
    let haveSomething = false;
    const firstLineNode = [...this.previewColumn.querySelectorAll('strong[data-line]')]
      .find((lineNode) => {
        const lineOffsetTop = findRelativeOffset(lineNode, this.previewColumn);
        if (lineOffsetTop >= editorScroll) {
          if (!haveSomething) {
            haveSomething = true;
            return true;
          }
          return lineOffsetTop <= editorScroll + this.state.height;
        }
        return false;
      });
    return Number(firstLineNode.dataset.line);
  }
  handleOutlineClick = (heading) => {
    this.ace.gotoLine(heading.ln);
    this.ace.scrollToLine(heading.ln - 1);
    this.ace.focus();
  }
  scrollPreviewToLine = (ln) => {
    let lineNode = this.previewColumn.querySelector(`strong[data-line="${ln}"]`);
    for (let i = ln; i > 0 && !lineNode; i -= 1) {
      lineNode = this.previewColumn.querySelector(`strong[data-line="${i}"]`);
    }
    this.previewColumn.scrollTop = findRelativeOffset(lineNode, this.previewColumn);
  }
  scrollEditorToLine = (ln) => {
    this.ace.scrollToLine(ln - 1);
  }
  handlePreviewScroll = () => {
    if (this.lastScrolled === 'editor') {
      this.lastScrolled = null;
      return;
    }
    const firstVisibleLine = this.getPreviewFirstVisibleLine();
    const deltaPositive = firstVisibleLine > this.ace.renderer.getFirstVisibleRow() + 1;

    // dont scroll editor if preview scroll "out of source" (e.g. footnotes)
    if (this.ace.renderer.isScrollableBy(null, deltaPositive ? 1 : -1)) {
      this.lastScrolled = 'preview';
      this.scrollEditorToLine(firstVisibleLine);
    }
  }
  handleEditorScroll = () => {
    if (this.lastScrolled === 'preview') {
      this.lastScrolled = null;
      return;
    }
    this.lastScrolled = 'editor';
    this.ace.renderer.$computeLayerConfig();
    const firstVisibleLine = this.ace.renderer.getFirstVisibleRow() + 1;
    this.scrollPreviewToLine(firstVisibleLine);
  }
  updateStateValue = (value) => {
    const { html, suggestions } = this.generateHtml(value);
    const raw = value;
    this.setState({
      raw,
      html,
      // eslint-disable-next-line react/no-unused-state
      suggestions,
      loc: raw.split('\n').length,
      outline: generateOutline(html, raw, this.props.language.excludeNode),
    });
  }
  handleChange = (value) => {
    if (this.stoppedTypingTimer) {
      clearTimeout(this.stoppedTypingTimer);
    }
    this.stoppedTypingTimer = setTimeout(
      () => this.handleStoppedTyping(value),
      STOPPED_TYPING_TIMEOUT,
    );
    this.setState({ raw: value });
  }
  handleStoppedTyping = (value) => {
    this.autosaveStore(value);
    this.updateStateValue(value);
  }
  autosaveStore = (value) => {
    const { date } = autosaveStore(value, this.props.content);
    this.setState({
      autosaved: date,
    });
  }
  autosaveRetrieve = () => {
    const retrieved = autosaveRetrieve(this.props.content);
    if (retrieved) {
      const { value, date } = retrieved;
      if (this.ace) {
        this.ace.setValue(value, -1);
      }
      this.updateStateValue(value);
      this.setState({
        autosaved: date,
      });
    }
  }
  handleStoppedCursorActivity = () => {
    this.updateCursor();
  }
  updateCursor = () => {
    if (this.ace) {
      const { row, column } = this.ace.selection.getCursor();
      this.setState({
        cursorLine: row + 1,
        cursorCol: column + 1,
      });
    }
  }
  generateHtml = (raw) => {
    const { lineSafeInsert, convert } = this.props.language;
    const { html, suggestions } = toHtmlWithNinjas(raw, lineSafeInsert, convert);
    const processPrevewHtml = htmlSrc => applyOnDom(htmlSrc, (node) => {
      node.querySelectorAll('a').forEach(n => n.setAttribute('target', '_blank'));
      this.props.language.postProcess(node);
    });

    return { html: processPrevewHtml(html), suggestions };
  }
  handleCommand = (command) => {
    getCommands(this)[command].execute();
  }
  handleCursorActivity = () => {
    if (this.stoppedCursorActivityTimer) {
      clearTimeout(this.stoppedCursorActivityTimer);
    }
    this.stoppedCursorActivityTimer = setTimeout(
      this.handleStoppedCursorActivity,
      STOPPED_CURSOR_ACTIVITY_TIMEOUT,
    );
  }
  toggleFullscreen = () => {
    screenfull.on('change', () => {
      if (!screenfull.isFullscreen && this.state.fullscreen) {
        this.setState({
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
      fullscreen: !this.state.fullscreen,
    });
  }
  handleOutlineOrderChange = (header, { oldIndex, newIndex }) => {
    // Do nothing if no distance
    if (oldIndex === newIndex) {
      return;
    }

    const setAceValueKeepSession = (ace, value) => {
      const scroll = ace.renderer.getScrollTop();
      const selection = ace.selection.toJSON();
      if (ace) {
        ace.setValue(value, -1);
        ace.renderer.scrollToY(scroll);
        ace.selection.fromJSON(selection);
        ace.focus();
      }
    };

    const newValue = (() => {
      // Container in which headers are swapped
      const container = header ? header.children : this.state.outline;
      // Header section to move
      const movingItem = container[oldIndex];

      // [cutStart, cutEnd, pasteStart, (pasteEnd)]
      const indicies = [
        movingItem,
        findNextSibling(movingItem),
        // Header section to paste before
        newIndex > oldIndex ? findNextSibling(container[newIndex]) : container[newIndex],
      ].map(item => (item ?
        item.pos : this.state.raw.length
      ));

      // Move the section
      return moveSubstring(this.state.raw, ...indicies);
    })();

    this.updateStateValue(newValue);

    if (this.ace) {
      setAceValueKeepSession(this.ace, newValue);
    }
  }
  renderProportianalStyles = () => {
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
  renderColumn = (colName, wrapperStyle) => {
    const getColumnInner = (name) => {
      switch (name) {
        case 'outline':
          return (
            <div className="column outline">
              <Outline
                outline={this.state.outline}
                onItemClick={this.handleOutlineClick}
                onOrderChange={this.handleOutlineOrderChange}
              />
            </div>
          );
        case 'editor':
          return (
            <div className="column editor" ref={(el) => { this.editorColumn = el; }}>
              <textarea
                ref={(el) => { this.textarea = el; }}
                onChange={e => this.handleChange(e.target.value)}
                defaultValue={this.state.raw}
              />
            </div>
          );
        case 'preview':
          return (
            <div className="column" onScroll={this.handlePreviewScroll} ref={(el) => { this.previewColumn = el; }}>
              <div
                className={`preview ${this.props.language.previewClassName}`}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.html }}
              />
            </div>
          );
        default:
          throw new Error(`Prompted to render unknown column ${name}`);
      }
    };
    return (
      <div key={colName} className={`columnWrapper ${colName}`} style={wrapperStyle}>
        {getColumnInner(colName)}
      </div>
    );
  }
  render() {
    let markupEditorStyles = {
      display: 'flex',
      width: this.props.width ? `${this.props.width}px` : '100%',
      height: this.props.height ? `${this.props.height}px` : '100%',
    };
    if (this.state.fullscreen) {
      markupEditorStyles = {
        ...markupEditorStyles,
        width: '100vw',
        height: '100vh',
      };
    }
    return (
      <div className="emily-editor-wrapper">
        <div
          className="emily-editor"
          role="presentation"
          style={markupEditorStyles}
          ref={(el) => { this.editor = el; }}
        >
          <CommandPalette
            ref={(el) => { this.commandPalette = el; }}
            options={getCommands(this)}
            onSelected={this.handleCommand}
            onExit={() => { this.ace.focus(); }}
          />
          <div className="workspace">
            {
              ['outline', 'editor', 'preview']
                .map((name) => {
                  const wrapperStyle = this.state.columns[name] ? {} : { display: 'none' };
                  return this.renderColumn(name, wrapperStyle);
                })
            }
          </div>
          <StatusBar
            loc={this.state.loc}
            col={this.state.cursorCol}
            line={this.state.cursorLine}
            autosaved={this.state.autosaved}
            commandPaletteCommand={getCommands(this).commandPalette}
            mode={this.props.language.name}
          />
        </div>
        <style jsx global>{`
                  .emily-editor-wrapper {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    align-items: flex-start;
                  }
                  .emily-editor {
                      position: relative;
                      border: 1px solid #eee;
                      border-bottom: 0;
                      width: auto;
                      height: auto;
                      display: flex;
                      align-items: flex-start;
                      padding-bottom: 20px;
                      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
                  }
                  .column.preview {
                      padding: 10px 60px;
                  }
                  .preview:focus {
                      outline: 0px solid transparent;
                  }
                  .column.preview > div {
                      padding: 0 50px 0 20px;
                  }
                  .column.preview .cursor {
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
                  .emily-editor .workspace {
                      align-items: stretch;
                      display: flex;
                      height: 100%;
                      width: 100%;
                      align-items: flex-start;
                  }
                  .emily-editor .workspace > .columnWrapper {
                      flex: 6;
                      overflow: hidden;
                      height: 100%;
                  }
                  .emily-editor .workspace > .columnWrapper > .column {
                      overflow-y: scroll;
                      overflow-x: hidden;
                      height: 100%;
                      position: relative; // important for scroll synchro!
                      // margin-right: -16px; // togle for scrollbar hiding
                  }
                  .emily-editor .workspace > .columnWrapper > .column.editor {
                      overflow: hidden;
                  }
                  .emily-editor .workspace > .columnWrapper.outline {
                    flex: 2;
                  }
                  .emily-editor .workspace {
                    overflow: hidden;
                  }
                  .ace_editor {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    font-size: 20px;
                    margin: 0;
                  }
                `}
        </style>
        {this.props.language.renderJsxStyle()}
        {this.renderProportianalStyles()}
      </div>
    );
  }
}
