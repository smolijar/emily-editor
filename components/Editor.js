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
            content: props.content,
            options: {
                mode: props.language,
            },
        };
        this.handleChange = this.handleChange.bind(this);
    }
    static propTypes = {
        content: PropTypes.string,
        language: PropTypes.string,
    }
    static defaultProps = {
        content: '',
        language: 'markdown',
    }
    handleChange(value) {
        this.setState({
            content: value,
        });
    }
    render() {
        const options = {};
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                </Head>
                <CodeMirror value={this.state.content} onChange={this.handleChange} options={this.state.options} />
            </div>
        );
    }
}

export default Editor;
