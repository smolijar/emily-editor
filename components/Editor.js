import PropTypes from 'prop-types';
import Head from 'next/head'
import CodeMirror from 'react-codemirror';
import CommandPalette from './CommandPalette';

// Shame, SSR avoid hack
if (typeof navigator !== 'undefined') {
    require('codemirror/mode/markdown/markdown');
}

const SMOOTHSCROLL_ITERATIONS = 15;
const SMOOTHSCROLL_INTERVAL = 30;
const CURSOR_STRING = '@@@@@';


class Editor extends React.Component {
    constructor(props) {
        super(props);
        const defaultCmOptions = {
            scrollbarStyle: null,
            lineWrapping: true,
            lineNumbers: true,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleCursorActivity = this.handleCursorActivity.bind(this);
        this.scrollToPreviewCursor = this.scrollToPreviewCursor.bind(this);
        this.generateOutline = this.generateOutline.bind(this);
        this.handleOutlineClick = this.handleOutlineClick.bind(this);
        this.handleCommand = this.handleCommand.bind(this);
        const html = props.toHtml(props.content);
        this.state = {
            raw: props.content,
            html,
            outline: this.generateOutline(html),
            activeLine: 0,
            smoothScrollTimer: null,
            columns: {
                'editor': true,
                'preview': true,
                'outline': false,
            },
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
    }
    static defaultProps = {
        content: '',
        language: 'markdown',
        toHtml: (src) => src,
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
        const lastStep = commandPath[commandPath.length-1];
        substate[lastStep] = !substate[lastStep];
        this.setState(state);
    }
    handleChange(value) {
        const html = this.props.toHtml(value);
        this.setState({
            raw: value,
            html,
            outline: this.generateOutline(html),
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
    handleCursorActivity(cm) {
        let activeLine = cm.getCursor().line;
        if (this.state.activeLine !== activeLine) {
            let rawLines = this.state.raw.split('\n');
            let renderContext = false;
            // move up while line has no `context`
            while(!renderContext) {
                activeLine--;
                // context is string that gets rendered as string in html
                [,,renderContext] = this.props
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
        if(previewCol && previewCursor) {
            if(this.state.smoothScrollTimer) {
                window.clearInterval(this.state.smoothScrollTimer);
                previewCol.scrollTop = Math.max(0, previewCursor.offsetTop - 400)
            }

            const interval = setInterval(smoothScrollIteration.bind(this), SMOOTHSCROLL_INTERVAL);
            let iterations = 0;
            this.setState({
                ...this.state,
                smoothScrollTimer: interval,
            });
            function smoothScrollIteration() {
                const from = previewCol.scrollTop;
                const to = Math.max(0, previewCursor.offsetTop - 400);
                const goTo = from + (to-from)/2;
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
    render() {
        const commandPaletteOptions = {
            'options.lineNumbers': 'Line numbers',
            'options.lineWrapping': 'Line wrapping',
            'columns.editor': 'Column editor',
            'columns.preview': 'Column preview',
            'columns.outline': 'Column outline',
        };
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
                </Head>
                <div className="markup-editor" onKeyDown={(e) => {
                        if(e.shiftKey && e.ctrlKey) {
                            switch(e.key) {
                                case 'p':
                                case 'P':
                                    e.preventDefault();
                                    this.refs.commandPalette.focus();
                                    console.log(this.refs.cmr.getCodeMirror().getSelection());
                            }
                        }
                    }}>
                    <CommandPalette
                        ref="commandPalette"
                        options={commandPaletteOptions}
                        onSelected={this.handleCommand}
                        onExit={() => {
                            this.refs.cmr.focus();
                            }}
                    />
                    <div className="toolbar">
                        <button onClick={() => this.refs.commandPalette.focus()}>Command Palette</button>
                    </div>
                    <div className="workspace">
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
                            <div className="column">
                                <CodeMirror ref="cmr" onCursorActivity={this.handleCursorActivity} value={this.state.raw} onChange={this.handleChange} options={this.state.options} />
                            </div>
                        }
                        {this.state.columns.preview &&
                            <div className="column">
                                <div className="preview" spellCheck="false" contentEditable onKeyPress={(e) => {e.preventDefault()}} dangerouslySetInnerHTML={{ __html: this.state.html }}></div>
                            </div>
                        }
                    </div>
                </div>
                <style jsx global>{`
                .CodeMirror {
                    font-family: 'Roboto Mono', monospace;
                    height: 600px;
                }
                .markup-editor .toolbar {
                    height: 20px;
                }
                .markup-editor {
                    border: 1px solid rgba(0,0,0,0.3);
                    width: 1200px;
                    position: relative;
                }
                .preview {
                    font-family: 'Roboto', sans-serif;
                    height: 100%;
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
                .markup-editor .workspace {
                    align-items: stretch;
                    display: flex;
                    height: 600px;
                    width: 1200px;
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
            </div>
        );
    }
}

export default Editor;
