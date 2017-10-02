import PropTypes from 'prop-types';
import Head from 'next/head'
import CodeMirror from 'react-codemirror';

// Shame, SSR avoid hack
if (typeof navigator !== 'undefined') {
    require('codemirror/mode/markdown/markdown');
}

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
            options: {
                mode: props.language,
                ...defaultCmOptions,
            },
        };
        this.handleChange = this.handleChange.bind(this);
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
    renderBoolOption(name) {
        const style = this.state.options[name] ? {} : { textDecoration: 'line-through' };
        return (
            <span style={style} onClick={() => {
                this.setState({
                    options: {
                        ...this.state.options,
                        [name]: !this.state.options[name],
                    }
                })
            }}>{name}
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
                        {this.renderBoolOption('lineNumbers')}
                        {this.renderBoolOption('lineWrapping')}
                    </div>
                    <div className="workspace">
                        <div className="column">
                            <CodeMirror value={this.state.raw} onChange={this.handleChange} options={this.state.options} />
                        </div>
                        <div className="column">
                            <div className="preview" dangerouslySetInnerHTML={{ __html: this.state.html }}></div>
                        </div>
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
                .preview {
                    font-family: 'Roboto', sans-serif;
                    padding: 0 50px 0 20px;
                }
                .markup-editor .workspace {
                    align-items: stretch;
                    display: flex;
                    height: 600px;
                    width: 1200px;
                    border: 1px solid rgba(0,0,0,0.3);
                }
                .markup-editor .workspace > .column {
                    flex: 1;
                    overflow-y: scroll;
                    overflow-x: hidden;
                }
                `}</style>
            </div>
        );
    }
}

export default Editor;
