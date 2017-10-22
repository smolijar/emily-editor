import React from 'react';
import PropTypes from 'prop-types';

class StatusBar extends React.Component {
    static propTypes = {
      loc: PropTypes.number,
      onCommandPalette: PropTypes.func,
      line: PropTypes.number,
      col: PropTypes.number,
    }
    static defaultProps = {
      loc: 0,
      onCommandPalette: () => console.warn('StatusBar: no onCommandPalette handler set.'),
      line: 1,
      col: 1,
    }
    render() {
      return (
        <div className="statusBar">
          <div className="left">
            <button onClick={this.props.onCommandPalette}>Command Palette</button>
            <span>{this.props.loc} Lines</span>
          </div>
          <div className="right">
            <span>
              Ln {this.props.line},
              Col {this.props.col}
            </span>
          </div>
          <style jsx>{`
                    .statusBar {
                        height: 20px;
                        background: #222;
                        color: #bbb;
                        font-size: 13px;
                        line-height: 20px;
                        font-family: 'Roboto', sans-serif;
                    }
                    .statusBar span {
                      margin: 0 10px;
                    }
                    .statusBar button,
                    .statusBar button:focus {
                        outline: none;
                    }
                    .statusBar button {
                        font-family: 'Roboto', sans-serif;
                        border: none;
                        background: none;
                        color: #bbb;
                        cursor: pointer;
                        height: 20px;
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
                `}
          </style>
        </div>
      );
    }
}

export default StatusBar;
