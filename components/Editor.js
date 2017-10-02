import PropTypes from 'prop-types';
import Head from 'next/head'
import CodeMirror from 'react-codemirror';

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: props.content,
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
        return (
            <div>
                <Head>
                    <link rel="stylesheet" type="text/css" href="markup-editor/lib/codemirror.css" />
                </Head>
                <CodeMirror value={this.state.content} onChange={this.handleChange} />
            </div>
        );
    }
}

export default Editor;
