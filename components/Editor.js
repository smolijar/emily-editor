import PropTypes from 'prop-types';
import Head from 'next/head'
import CodeMirror from 'react-codemirror';
import CommandPalette from './CommandPalette';
import StatusBar from './StatusBar';

// Shame, SSR avoid hack
if (typeof navigator !== 'undefined') {
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
}

const SCROLL_TIMEOUT = 5;


class Editor extends React.Component {
    constructor(props) {
        super(props);
        const defaultCmOptions = {
            scrollbarStyle: null,
            lineWrapping: true,
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
            theme: 'ttcn',
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                'Ctrl-P': 'jumpToLine',
                'Ctrl-Space': 'autocomplete',
                'Ctrl-Q': function (cm) { cm.foldCode(cm.getCursor());},
            },
            keyMap: 'sublime',
        };
        this.handleChange = this.handleChange.bind(this);
        this.generateOutline = this.generateOutline.bind(this);
        this.generateHtml = this.generateHtml.bind(this);
        this.handleOutlineClick = this.handleOutlineClick.bind(this);
        this.renderProportianalStyles = this.renderProportianalStyles.bind(this);
        this.handleCommand = this.handleCommand.bind(this);
        this.handleEditorScroll = this.handleEditorScroll.bind(this);
        this.handlePreviewScroll = this.handlePreviewScroll.bind(this);
        this.getVisibleLines = this.getVisibleLines.bind(this);
        const html = this.generateHtml(props.content);
        const raw = props.content;
        this.state = {
            width: props.width,
            height: props.height,
            raw,
            proportionalSizes: true,
            html,
            outline: this.generateOutline(html),
            activeLine: 0,
            smoothScrollTimer: null,
            newScrollTimer: null,
            columns: {
                'editor': true,
                'preview': true,
                'outline': false,
            },
            lastScrolled: null,
            loc: raw.split('\n').length,
            options: {
                mode: props.language,
                ...defaultCmOptions,
            },
        };
    }
    static propTypes = {
        content: PropTypes.string,
        language: PropTypes.string,
        toHtml: PropTypes.func,
        width: PropTypes.number,
        height: PropTypes.number,
    }
    static defaultProps = {
        content: '',
        language: 'markdown',
        toHtml: (src) => src,
        width: 500,
        height: 500,
    }
    componentDidMount() {
        document.querySelector('.CodeMirror').style.height = `${this.state.height}px`;
    }
    handleCommand(command) {
        const state = this.state;
        let substate = state;

        const commandPath = command.split('.');
        commandPath.slice(0, commandPath.length - 1).forEach(
            step => {
                substate = substate[step];
            }
        );
        const lastStep = commandPath[commandPath.length - 1];
        substate[lastStep] = !substate[lastStep];
        this.setState(state);
    }
    generateHtml(_raw) {
        function lineIsSafeToEdit(line) {
            return !line.match(/[\|\]`]\w*/);
        }
        const raw = _raw
        .split('\n')
        .map((line, i, arr) => {
            if(lineIsSafeToEdit(line) && (!arr[i+1] || lineIsSafeToEdit(arr[i+1]))) {
                return `${line} @@@${i+1}@@@ \n`;
            }
            return line;
        })
        .join('\n');
        return this.props.toHtml(raw).replace(/@@@([0-9]+)@@@/g, '<strong data-line="$1">($1)</strong>');
    }
    handleChange(value) {
        const html = this.generateHtml(value);
        const raw = value;
        this.setState({
            raw,
            html,
            loc: raw.split('\n').length,
            outline: this.generateOutline(html),
        });
    }
    handleEditorScroll() {
        if(this.state.lastScrolled === 'preview') {
            this.setState({...this.state, lastScrolled: null});
            return;
        }
        function scrollPreview() {
            const [firstLine] = this.getVisibleLines(this.editorColumn, '.CodeMirror-line');
            let lineHelperNode = null;
            let currentLine = firstLine;
            while(lineHelperNode === null && currentLine > 0) {
                lineHelperNode = document.querySelector(`.preview strong[data-line="${currentLine--}"]`);
            }
            const offset = lineHelperNode ? lineHelperNode.offsetTop : 0;
            this.previewColumn.scrollTop = offset;
            this.setState({...this.state, newScrollTimer: null});
        }
        if(this.state.newScrollTimer) {
            clearTimeout(this.state.newScrollTimer);
        }
        this.setState({
            ...this.state,
            newScrollTimer: setTimeout(scrollPreview.bind(this), SCROLL_TIMEOUT),
            lastScrolled: 'editor',
        });
    }
    handlePreviewScroll() {
        if(this.state.lastScrolled === 'editor') {
            this.setState({...this.state, lastScrolled: null});
            return;
        }
        function scrollEditor() {
            const [firstLine] = this.getVisibleLines(this.previewColumn, '[data-line]', (lineNode => Number(lineNode.dataset.line)));
            let lineHelperNode = [...this.editorColumn.querySelectorAll('.CodeMirror-line')][firstLine-1].parentElement;
            const offset = lineHelperNode ? lineHelperNode.offsetTop : 0;
            this.editorColumn.scrollTop = offset;
            this.setState({...this.state, newScrollTimer: null});
        }
        if(this.state.newScrollTimer) {
            clearTimeout(this.state.newScrollTimer);
        }
        this.setState({
            ...this.state,
            newScrollTimer: setTimeout(scrollEditor.bind(this), SCROLL_TIMEOUT),
            lastScrolled: 'preview',
        });
    }
    handleOutlineClick(heading) {
        const inCode = heading.content;
        const cm = this.refs.cmr.getCodeMirror();
        const value = cm.getValue();
        const pos = value.indexOf(inCode);
        const line = value.substr(0, pos).split('\n').length - 1;
        cm.setCursor(line);
        this.refs.cmr.focus();
    }
    getVisibleLines(columnNode, lineSelector, numberSelector = null) {
        const editorScroll = columnNode.scrollTop;
        let firstVisibleLine = null;
        const visibleLines = [...columnNode.querySelectorAll(lineSelector)]
        .map((_, i) => [_, i])
        .filter(([lineNode, i]) => {
            const lineOffsetTop = lineNode.parentElement.offsetTop;
            if(lineOffsetTop >= editorScroll) {
                if(firstVisibleLine === null) {
                    firstVisibleLine = i;
                    return true;
                }
                return lineOffsetTop <= editorScroll + this.state.height;
            }
            return false;
        })
        // if numberSelector null, use index
        .map(([lineNode, i]) => numberSelector ? numberSelector(lineNode) : i);
        return visibleLines;
    }
    generateOutline(html) {
        const outline = html
            .match(/<h[0-9][^<>]*>.*<\/h[0-9]>/g)
            .map(heading => {
                const [, level, id, content] = heading.match(/<h([0-9])[^<>]*id="(.*)"[^<>]*>(.*)<\/h[0-9]>/);
                return { content, level: +level, id, children: [], path: [] };
            })
            .reduce((acc, val) => {
                function insert(into, what, acc) {
                    if (into.children.length === 0 || what.level - into.level == 1) {
                        what.path.push(into.children.length - 1);
                        into.children.push(what);
                    } else if (into.level < what.level) {
                        what.path.push(into.children.length - 1);
                        insert(into.children[into.children.length - 1], what, acc);
                    }
                    else {
                        let anotherInto = acc[what.path[0]];
                        what.path.slice(1, what.path.length - 1).forEach(i => {
                            anotherInto = anotherInto.children[i];
                        });
                        anotherInto.children.push(what);
                    }
                }
                if (acc.length === 0) {
                    acc.push({ ...val, path: [0] });
                }
                else {
                    const lastHeading = acc[acc.length - 1];
                    const lastLevel = lastHeading.level;
                    if (val.level <= lastLevel) {
                        acc.push({ ...val, path: [acc.length - 1] });
                    } else {
                        val.path = [acc.length - 1];
                        insert(acc[acc.length - 1], val, acc);
                    }
                }
                return acc;
            }, []);

        return outline;
    }
<<<<<<< HEAD
    handleCursorActivity(cm) {
        let activeLine = cm.getCursor().line;
        if (this.state.activeLine !== activeLine) {
            let rawLines = this.state.raw.split('\n');
            let renderContext = false;
            // move up while line has no `context`
            while (!renderContext) {
                activeLine--;
                // context is string that gets rendered as string in html
                [, , renderContext] = this.props
                    .toHtml(rawLines[activeLine])
                    .replace('\n', '')
                    .match(/^(<.*>)*(\w+)/) || [];
            }

            rawLines[activeLine] = rawLines[activeLine]
                .replace(renderContext, `${renderContext}${CURSOR_STRING}`);

            this.setState({
                ...this.state,
                activeLine,
                html: this.props
                    .toHtml(rawLines.join('\n'))
                    .replace(CURSOR_STRING, '<span class="cursor">|</span>'),
            });
            this.scrollToPreviewCursor();
        }
    }
    scrollToPreviewCursor() {
        const previewCol = document.querySelector('.preview').parentElement;
        const previewCursor = document.querySelector('.preview .cursor');
        const centeringOffset = this.state.height/2.2;
        if (previewCol && previewCursor) {
            if (this.state.smoothScrollTimer) {
                window.clearInterval(this.state.smoothScrollTimer);
                previewCol.scrollTop = Math.max(0, previewCursor.offsetTop - centeringOffset)
            }

            const interval = setInterval(smoothScrollIteration.bind(this), SMOOTHSCROLL_INTERVAL);
            let iterations = 0;
            this.setState({
                ...this.state,
                smoothScrollTimer: interval,
            });
            function smoothScrollIteration() {
                const from = previewCol.scrollTop;
                const to = Math.max(0, previewCursor.offsetTop - centeringOffset);
                const goTo = from + (to - from) / 2;
                previewCol.scrollTop = goTo;
                iterations++;
                if (iterations >= SMOOTHSCROLL_ITERATIONS || Math.abs(goTo - to) < 2) {
                    previewCol.scrollTop = to;
                    clearInterval(interval);
                    this.setState({
                        ...this.state,
                        smoothScrollTimer: null,
                    });
                }
            }
        }
    }
    renderProportianalStyles() {
        if(this.state.proportionalSizes) {
            return (
                <style jsx global>{`
                    .cm-header-1 { font-size: 2em; }
                    .cm-header-2 { font-size: 1.5em; }
                    .cm-header-3 { font-size: 1.17em; }
                    .cm-header-4 { font-size: 1.12em; }
                    .cm-header-5 { font-size: .83em; }
                    .cm-header-6 { font-size: .75em; }
                `}</style>
            )
        }
    }
=======
>>>>>>> dev
    render() {
        const commandPaletteOptions = {
            'options.lineNumbers': 'Line numbers',
            'options.lineWrapping': 'Line wrapping',
            'columns.editor': 'Column editor',
            'columns.preview': 'Column preview',
            'columns.outline': 'Column outline',
            'proportionalSizes': 'Proportional sizes',
        };
        const workspaceStyles = {
            width: `${this.state.width}px`,
            height: `${this.state.height}px`,
        }
        const markupEditorStyles = {
            width: `${this.state.width}px`,
        }
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
                    <link rel="stylesheet" type="text/css" href="markup-editor/theme/ttcn.css" />
                    <link rel="stylesheet" type="text/css" href="markup-editor/addon/dialog/dialog.css" />
                    <link rel="stylesheet" type="text/css" href="markup-editor/addon/fold/foldgutter.css" />
                </Head>
                <div
                    className="markup-editor"
                    onKeyDown={(e) => {
                        if (e.shiftKey && e.ctrlKey) {
                            switch (e.key) {
                                case 'p':
                                case 'P':
                                    e.preventDefault();
                                    this.refs.commandPalette.focus();
                                    console.log(this.refs.cmr.getCodeMirror().getSelection());
                            }
                        }
                    }}
                    style={markupEditorStyles}
                >
                    <CommandPalette
                        ref="commandPalette"
                        options={commandPaletteOptions}
                        onSelected={this.handleCommand}
                        onExit={() => {
                            this.refs.cmr.focus();
                        }}
                    />
                    <div className="workspace" style={workspaceStyles}>
                        {
                            this.state.columns.outline &&
                            <div className="column">
                                <ol>
                                    {this.state.outline.map((heading) => {
                                        function printList(h, index) {
                                            return (<li key={`${h.id}${index}`}>
                                                <a onClick={() => this.handleOutlineClick(h)}>{h.content}</a>
                                                {h.children.length > 0 &&
                                                    <ol key={`${h.id}${index}ol`}>
                                                        {h.children.map(printList.bind(this))}
                                                    </ol>
                                                }
                                            </li>);
                                        }
                                        return (
                                            printList.bind(this)(heading, 0)
                                        );
                                    })}
                                </ol>
                            </div>
                        }
                        {this.state.columns.editor &&
                            <div className="column" onScroll={this.handleEditorScroll} ref={el => this.editorColumn = el}>
                                <CodeMirror
                                    ref="cmr"
                                    onCursorActivity={this.handleCursorActivity}
                                    value={this.state.raw}
                                    onChange={this.handleChange}
                                    options={this.state.options}
                                />
                            </div>
                        }
                        {this.state.columns.preview &&
                            <div className="column" onScroll={this.handlePreviewScroll} ref={el => this.previewColumn = el}>
                                <div
                                    className="preview"
                                    spellCheck="false"
                                    contentEditable onKeyPress={(e) => { e.preventDefault() }}
                                    dangerouslySetInnerHTML={{ __html: this.state.html }}
                                >
                                </div>
                            </div>
                        }
                    </div>
                    <StatusBar loc={this.state.loc} onCommandPalette={() => this.refs.commandPalette.focus()} />
                </div>
                <style jsx global>{`
                .CodeMirror {
                    font-family: 'Roboto Mono', monospace;
                }
                
                .markup-editor {
                    position: relative;
                    border: 1px solid #333;
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
                    display: block;
                    visibility: hidden;
                    width: 0;
                    height: 0;
                }
                .markup-editor .workspace {
                    align-items: stretch;
                    display: flex;
                }
                .markup-editor .workspace > .column {
                    flex: 1;
                    overflow-y: scroll;
                    overflow-x: hidden;
                }
                .markup-editor .workspace > .column::-webkit-scrollbar {
                    width: 0;
                    background: transparent;
                }
                `}</style>
                {this.renderProportianalStyles()}
            </div>
        );
    }
}

export default Editor;
