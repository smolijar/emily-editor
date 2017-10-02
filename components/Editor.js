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
        this.state = {
            raw: props.content,
            html: props.toHtml(props.content),
            options: {
                mode: props.language,
            },
        };
        this.handleChange = this.handleChange.bind(this);
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
    render() {
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                </Head>
                <div className="markup-editor">
                    <CodeMirror value={this.state.raw} onChange={this.handleChange} options={this.state.options} />
                    <div className="preview" dangerouslySetInnerHTML={{ __html: this.state.html }}></div>
                </div>
            </div>
        );
    }
}

export default Editor;
