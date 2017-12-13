import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';

const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ESCAPE = 27;

class CommandPalette extends React.Component {
    static propTypes = {
      options: PropTypes.objectOf(PropTypes.string).isRequired,
      onSelected: PropTypes.func.isRequired,
      onExit: PropTypes.func.isRequired,
    }
    constructor(props) {
      super(props);
      autoBind(this);
      this.state = {
        value: '',
        selected: 0,
        show: Object.keys(this.props.options),
        visible: false,
        mouseover: false,
      };
    }
    hide() {
      this.setState({
        ...this.state,
        visible: false,
        value: '',
        selected: 0,
        show: Object.keys(this.props.options),
      }, this.props.onExit);
    }
    focus() {
      this.setState({
        ...this.state,
        visible: true,
      }, () => this.input.focus());
    }
    handleChange(e) {
      const { value } = e.target;
      const show = Object.keys(this.props.options)
        .filter(optionKey => this.props.options[optionKey]
          .toLowerCase()
          .includes(value.toLowerCase()));
      this.setState({
        ...this.state,
        value,
        show,
        selected: 0,
      }, () => {
        this.nav.scrollTop = 0;
      });
    }
    handleKeyPress(e) {
      const { selected } = this.state;
      if (e.key === 'Enter') {
        this.props.onSelected(this.state.show[selected]);
        this.hide();
      }
    }
    handleKeyDown(e) {
      if (e.keyCode === ARROW_DOWN || e.keyCode === ARROW_UP) {
        let { selected } = this.state;
        if (e.keyCode === ARROW_UP) {
          selected -= 1;
        } else {
          selected += 1;
        }
        selected = (selected + this.state.show.length) % this.state.show.length;
        this.setState({
          ...this.state,
          selected,
        }, () => {
          const button = this.nav.querySelector('.command-palette button.selected');
          this.nav.scrollTop = button.offsetTop - (118 * 2);
        });
      }
      if (e.keyCode === ESCAPE) {
        this.hide();
      }
    }
    render() {
      const mouseOn = () => this.setState({
        mouseover: true,
      });
      const mouseOff = () => this.setState({
        mouseover: false,
      });
      return (
        <div
          style={{ display: this.state.visible ? 'block' : 'none' }}
          className="command-palette"
          onMouseOver={mouseOn}
          onFocus
          onMouseOut={mouseOff}
          onBlur={mouseOff}
        >
          <div className="inputWrapper">
            <input
              ref={(el) => { this.input = el; }}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleKeyPress}
              onBlur={() => {
                if (!this.state.mouseover) {
                  this.hide();
                }
              }}
              value={this.state.value}
            />
          </div>
          <nav ref={(el) => { this.nav = el; }}>
            {this.state.show
                .map((optionKey, index) => (
                  <button
                    className={index === this.state.selected ? 'selected' : ''}
                    key={optionKey}
                    onClick={() => {
                      this.props.onSelected(optionKey);
                      this.hide();
                    }}
                  >
                    {this.props.options[optionKey]}
                  </button>
                ))
            }
          </nav>
          <style jsx>{`
                  .command-palette {
                      background-color: #e9e9e9;
                      font-family: inherit;
                      padding: 10px 0 5px 0;
                      display: block;
                      position: absolute;
                      width: 50%;
                      z-index: 10;
                      box-sizing: border-box;
                      margin: auto;
                      left: 0;
                      right: 0;
                  }
                  input:focus {
                      outline: none;
                  }
                  .inputWrapper {
                      padding: 10px 10px 5px 10px;
                  }
                  input {
                      font-family: inherit
                      width: 100%;
                      border: 1px solid #ccc;
                      padding: 7px 23px;
                      background: #f5f5f5;
                      color: #444;
                      margin-bottom: 5px;
                      font-size: 16px;
                      box-sizing: border-box;
                  }
                  .command-palette::before {
                      display: block;
                      content: '>';
                      position: absolute;
                      top: 28px;
                      left: 20px;
                      opacity: 0.5;
                  }
                  nav {
                      list-style-type: none;
                      padding-left: 0;
                      max-height: 300px;
                      width: 100%;
                      overflow: hidden;
                      margin-top: 11px;
                      line-height: 22px;
                      margin: 1px;
                      line-height: 20px;
                      box-sizing: border-box;
                  }
                  nav button {
                      box-sizing: border-box;
                      margin: 3px 0;
                      padding: 0 8px;
                      font-size: 12px;
                      cursor: pointer;
                      display: block;
                      width: 100%;
                      background: transparent;
                      border: 0;
                      font-family: inherit;
                      padding: 5px 10px;
                      text-align: left;
                      color: #aaa;
                  }
                  nav button.selected, nav button:hover {
                      background-color: #ddd;
                      color: #444;
                  }
              `}
          </style>
        </div>
      );
    }
}

export default CommandPalette;
