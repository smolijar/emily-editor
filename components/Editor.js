import PropTypes from 'prop-types';
import Head from 'next/head'
import CodeMirror from 'react-codemirror';

// Shame, SSR avoid hack
if (typeof navigator !== 'undefined') {
    require('codemirror/mode/markdown/markdown');
}

const COLUMNS = {
    EDITOR: 'EDITOR',
    PREVIEW: 'PREVIEW',
};

class Editor extends React.Component {
    constructor(props) {
        super(props);
        const defaultCmOptions = {
            scrollbarStyle: null,
            lineWrapping: true,
            lineNumbers: true,
        };
        this.state = {
            raw: props.content,
            html: props.toHtml(props.content),
            activeLine: 0,
            columns: {
                [COLUMNS.EDITOR]: true,
                [COLUMNS.PREVIEW]: true,
            },
            options: {
                mode: props.language,
                ...defaultCmOptions,
            },
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleCursorActivity = this.handleCursorActivity.bind(this);
        this.renderBoolOption = this.renderBoolOption.bind(this);
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
    handleChange(value) {
        this.setState({
            raw: value,
            html: this.props.toHtml(value),
        });
    }
    handleCursorActivity(cm) {
        let activeLine = cm.getCursor().line;
        if (this.state.activeLine !== activeLine) {
            const lines = cm.lineCount();
            const raw = this.state.raw;
            let rawLines = raw.split('\n');
            while(!rawLines[activeLine].match(/\w$/)) {
                activeLine--;
            }
            rawLines[activeLine] = rawLines[activeLine].replace(/(\W*)(\w+)(\W*)$/,'$1$2@$3')
            this.setState({
                ...this.state,
                activeLine,
                html: this.props.toHtml(rawLines.join('\n'))
                .replace('@', '<span class="cursor">|</span>')
            });
            const previewCol = document.querySelector('.preview').parentElement;
            const previewCursor = document.querySelector('.preview .cursor');
            if(previewCol && previewCursor) {
                previewCol.scrollTop = previewCursor.offsetTop - 400;
            }
        }
    }
    renderBoolOption(name, parent = null) {
        const getSetterFunction = (name, parent) => {
            if (parent) {
                return () => {
                    this.setState({
                        [parent]: {
                            ...this.state[parent],
                            [name]: !this.state[parent][name],
                        }
                    })
                }
            };
            return () => {
                this.setState({
                    ...this.state,
                    [name]: !this.state[name],
                })
            }
        };
        const value = parent ? this.state[parent][name] : this.state[name];
        const style = value ? {} : { textDecoration: 'line-through' };
        return (
            <span style={style} onClick={getSetterFunction(name, parent)}>{name}
            </span>
        );
    };
    render() {
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                    <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono" rel="stylesheet" />
                </Head>
                <div className="markup-editor">
                    <div className="toolbar">
                        {this.renderBoolOption('lineNumbers', 'options')}
                        {this.renderBoolOption('lineWrapping', 'options')}
                        {this.renderBoolOption(COLUMNS.EDITOR, 'columns')}
                        {this.renderBoolOption(COLUMNS.PREVIEW, 'columns')}
                    </div>
                    <div className="workspace">
                        {this.state.columns[COLUMNS.EDITOR] &&
                            <div className="column">
                                <CodeMirror onCursorActivity={this.handleCursorActivity} value={this.state.raw} onChange={this.handleChange} options={this.state.options} />
                            </div>
                        }
                        {this.state.columns[COLUMNS.PREVIEW] &&
                            <div className="column">
                                <div className="preview" dangerouslySetInnerHTML={{ __html: this.state.html }}></div>
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
                }
                .preview {
                    font-family: 'Roboto', sans-serif;
                    height: 100%;
                }
                .preview > div {
                    padding: 0 50px 0 20px;
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
