import PropTypes from 'prop-types';

class StatusBar extends React.Component {
    static propTypes = {
        loc: PropTypes.number,
        onCommandPalette: PropTypes.func,
    }
    static defaultProps = {
        loc: 0,
        onCommandPalette: () => console.warn('StatusBar: no onCommandPalette handler set.'),
    }
    render() {
        return(
            <div className="statusBar">
                <div className="left">
                    <button onClick={this.props.onCommandPalette}>Command Palette</button>
                </div>
                <div className="right">
                    Ln {this.props.loc}
                </div>
                <style jsx>{`
                    .statusBar {
                        height: 20px;
                        background: #333;
                        color: #ddd;
                    }
                    .statusBar button,
                    .statusBar button:focus {
                        outline: none;
                    }
                    .statusBar button {
                        border: none;
                        background: none;
                        color: #ddd;
                    }
                    .statusBar button:hover {
                        background: rgba(0,0,0,0.5);
                    }
                    .statusBar .left {
                        float: left;
                    }
                    .statusBar .right {
                        float: right;
                    }
                `}</style>
            </div>
        );
    }
}

export default StatusBar;