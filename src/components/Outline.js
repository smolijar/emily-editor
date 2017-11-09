import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
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
    autoBind(this);
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
              padding: 2px 5px 2px 0;
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
            .list:first-child {
              margin-top: 0;
              margin-bottom: 0;
              padding-left: 0px;
              border-top: 0;
            }
            .list:last-child {
              margin-bottom: 0;
            }
            .item:last-child {
              margin-bottom: 0;
            }
            .item:first-child {
              margin-top: 0;
            }
            .item {
              margin: 2px 0;
              position: relative;
            }
            .item .item-wrapper {
              background: rgba(255,255,255,.1);
              display: block;
              margin: 4px;
              padding: 4px;
              width: calc(100% - 5px);
              padding-left: 10px;
              padding-left: 23px;
            }
            .item .item-wrapper:hover {
              opacity: 0.6;
              border-right: 5px solid #bbb;
            }
            .item .dragHandle, .item .toggle {
              display: inline-block;
              cursor: pointer;
              opacity: 0.5;
            }
            .item .toggle {
              position: absolute;
              left: 12px;
              top: 0.12em;
              z-index: 1;
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
              width: calc(100% - 60px);
              position: absolute;
            }
            .item button {
              font-weight: bold;
              cursor: pointer;
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
            .item.level-1 .item-wrapper { padding-top: 8px; padding-bottom: 8px; background: rgba(255,255,255,.1) }
            .item.level-2, .item.level-2 button { font-size: 14px; }
            .item.level-2 .item-wrapper { padding-top: 5px; padding-bottom: 5px; background: rgba(255,255,255,.1) }
            .item.level-3, .item.level-3 button { font-size: 12px; }
            .item.level-3 .item-wrapper { padding-top: 2px; padding-bottom: 2px; background: rgba(255,255,255,.05) }
            .item.level-4, .item.level-4 button { font-size: 12px; }
            .item.level-4 .item-wrapper { padding-top: 2px; padding-bottom: 2px; background: rgba(255,255,255,.05) }
            .item.level-5, .item.level-5 button { font-size: 12px; }
            .item.level-5 .item-wrapper { padding-top: 1px; padding-bottom: 1px; background: rgba(255,255,255,.025) }
            .item.level-6, .item.level-6 button { font-size: 12px; }
            .item.level-6 .item-wrapper { padding-top: 0; padding-bottom: 0; background: rgba(255,255,255,.025) }
        `}
        </style>
      </div>
    );
  }
}

export default Outline;
