import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';

const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ESCAPE = 27;

const COLOR = '#d3e2f2';

class CommandPalette extends React.Component {
    static propTypes = {
      options: PropTypes.objectOf(PropTypes.string),
      onSelected: PropTypes.func,
      onExit: PropTypes.func,
    }
    static defaultProps = {
      options: {},
      onSelected: () => console.warn('No listener function for Command Palette'),
      onExit: () => {},
    }
    constructor(props) {
      super(props);
      autoBind(this);
      this.state = {
        value: '',
        selected: 0,
        show: Object.keys(this.props.options),
        visible: false,
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
        const ul = document.querySelector('.command-palette ul');
        ul.scrollTop = 0;
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
          console.log(this.state.show[selected]);
          const ul = document.querySelector('.command-palette ul');
          const li = document.querySelector('.command-palette li.selected');
          ul.scrollTop = li.offsetTop - (118 * 2);
        });
      }
      if (e.keyCode === ESCAPE) {
        this.hide();
      }
    }
    render() {
      return (
        <div style={{ display: this.state.visible ? 'block' : 'none' }} className="command-palette">
          <div className="inputWrapper">
            <input
              ref={(el) => { this.input = el; }}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleKeyPress}
              onBlur={this.hide}
              value={this.state.value}
            />
          </div>
          <ul>
            {this.state.show
                .map((optionKey, index) => (
                  <li className={index === this.state.selected ? 'selected' : ''} key={optionKey}>
                    {this.props.options[optionKey]}
                  </li>
                ))
            }
          </ul>
          <style jsx>{`
                  .command-palette {
                      background-color: #e9e9e9;
                      color: #444;
                      font-family: 'Roboto', sans-serif;
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
                      width: 100%;
                      border: 1px solid ${COLOR};
                      padding: 7px 23px;
                      background: #f5f5f5;
                      color: #444;
                      margin-bottom: 5px;
                      font-size: 16px;
                      box-sizing: border-box;
                  }
                  .command-palette::before {
                      display: block;
                      content: ">";
                      position: absolute;
                      top: 25px;
                      left: 20px;
                      opacity: 0.5;
                  }
                  ul {
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
                  ul li {
                      box-sizing: border-box;
                      {/* background-color: orange; */}
                      margin: 3px 0;
                      padding: 0 8px;
                      font-size: 12px;
                  }
                  ul li.selected {
                      background-color: ${COLOR};
                  }
              `}
          </style>
        </div>
      );
    }
}

export default CommandPalette;
