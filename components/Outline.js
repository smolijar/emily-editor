import React from 'react';
import PropTypes from 'prop-types';
import SortableList from './outline/SortableList';

class Outline extends React.Component {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    onOrderChange: PropTypes.func.isRequired,
    outline: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.string,
      id: PropTypes.string,
      dupIndex: PropTypes.number,
      children: PropTypes.array,
    })).isRequired,
  }
  static defaultProps = {
  }
  constructor(props) {
    super(props);
    this.onSectionToggle = this.onSectionToggle.bind(this);
    this.state = {
      hidden: {},
    };
  }
  onSectionToggle(key) {
    this.setState({
      ...this.state,
      hidden: {
        ...this.state.hidden,
        [key]: !this.state.hidden[key],
      },
    });
  }
  render() {
    return (
      <div className="root">
        <SortableList
          items={this.props.outline}
          onSortEnd={indicies => this.props.onOrderChange(null, indicies)}
          pressDelay={200}
          onOrderChange={this.props.onOrderChange}
          onItemClick={this.props.onItemClick}
          hidden={this.state.hidden}
          onSectionToggle={this.onSectionToggle}
        />
        <style jsx global>{`
            .root {
              font-family: 'Roboto', sans-serif;
              background-color: #222;
              color: #ddd;
              min-height: 100%;
            }
            button:active, button:focus {
              outline: 0;
            }
            .list {
              list-style-type: none;
              padding-left: 15px;
              margin-bottom: 5px;
              position: relative;
            }
            .list:not(:first-child)::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0.22em;
              background-color: #444;
              display: block;
              width: 1px;
              height: 100%;
            }
            .list:first-child {
              margin-top: 0;
              padding-left: 0px;
              border-top: 0;
            }
            .item:first-child {
              margin-top: 0;
            }
            .item {
              margin: 2px 0;
            }
            .item .dragHandle, .item .toggle {
              display: inline-block;
              cursor: pointer;
              opacity: 0.5;
            }
            .item .dragHandle {
              margin-right: 5px;
              cursor: move;
            }
            .toggle::before {
              display: inline-block;
              width: 10px;
            }
            .toggle.invisible::before {
              opacity: 0;
            }
            .toggle.opened::before {
              content: '⌵';
              padding: 0 0.21em 0 0;
            }
            .toggle.closed::before {
              content: '❯';
              font-size: 0.55em;
              padding: 0 0 0 0.21em;
            }
            .item button.outlineItem {
              width: calc(100% - 42px);
              position: absolute;
            }
            .item button {
              font-weight: bold;
              cursor: pointer;
              display: inline-block;
              text-align: left;
              color: #ddd;
              background-color: transparent;
              padding: 5px 0;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              border: 0;
            }
            .item.level-1, .item.level-1 button { font-size: 16px; }
            .item.level-2, .item.level-2 button { font-size: 14px; }
            .item.level-3, .item.level-3 button { font-size: 12px; }
            .item.level-4, .item.level-4 button { font-size: 12px; }
            .item.level-5, .item.level-5 button { font-size: 12px; }
            .item.level-6, .item.level-6 button { font-size: 12px; }
        `}
        </style>
      </div>
    );
  }
}

export default Outline;
