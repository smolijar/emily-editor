import PropTypes from 'prop-types';

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: props.content,
        };
    }
    static propTypes = {
        content: PropTypes.string,
        language: PropTypes.string,
    }
    static defaultProps = {
        content: '',
        language: 'markdown',
    }
    render() {
        return (
            <textarea value={this.props.content} readOnly></textarea>
        );
    }
}

export default Editor;
