import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import SortableList from './outline/SortableList';

export default class Outline extends React.PureComponent {
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
          onOrderChange={this.props.onOrderChange}
          onItemClick={this.props.onItemClick}
          hidden={this.state.hidden}
          onSectionToggle={this.onSectionToggle}
          useDragHandle
        />
        <style jsx global>{`
            .root {
              background-color: #eee;
              color: #555;
              min-height: 100%;
            }
            .root button {
              font-weight: 300;
            }
            button:active, button:focus {
              outline: 0;
            }
            .list {
              margin: 0;
              padding: 0;
              padding-left: 15px;
              margin-bottom: 5px;
            }
            .list:first-child {
              margin-top: 0;
              margin-bottom: 0;
              padding-left: 0px;
            }
            .list:last-child {
              margin-bottom: 0;
            }
            .outline-item:last-child {
              margin-bottom: 0;
            }
            .outline-item:first-child {
              margin-top: 0;
            }
            .outline-item {
              margin: 2px 0;
              list-style-type: none;
            }
            .root .list:first-child .item-wrapper {
              margin-top: 0;
            }
            .root .list:last-child .item-wrapper {
              margin-bottom: 0;
            }
            .outline-item .item-wrapper {
              color: #555;
              display: block;
              margin: 0;
              padding: 4px;
              width: 100%;
              padding-left: 23px;
              padding-right: 20px;
              position: relative;
            }
            .outline-item .item-wrapper:hover {
              background: rgba(0,0,0,.05);
              padding-right: 40px;
            }
            .outline-item .dragHandle, .outline-item .toggle {
              display: inline-block;
              cursor: pointer;
              opacity: 0.5;
            }
            .outline-item .toggle {
              color: #555;
              position: absolute;
              left: 9px;
              top: 0.12em;
              z-index: 1;
            }
            .outline-item .item-wrapper:hover .dragHandle {
              opacity: 1;
            }
            .outline-item .dragHandle {
              color: #bbb;
              opacity: 0;
              position: absolute;
              right: 20px;
              bottom: 0.54em;
              font-weight: normal;
              cursor: move;
            }
            .toggle::before {
              display: inline-block;
              content: '⌵';
              position: relative;
            }
            .toggle.invisible::before {
              opacity: 0;
            }
            .toggle.closed::before {
              transform: rotate(-90deg);
              left: -5px;
              margin-top: 0.2em;
            }
            .outline-item button.text {
              width: calc(100% - 60px);
              position: absolute;
            }
            .outline-item button {
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

            body > .outline-item > .item-wrapper {
              background: rgba(0,0,0,.05);
            }
            body > .outline-item {
              z-index: 10;
              pointer-events: auto !important;
              cursor: grabbing !important;
              cursor: -moz-grabbing !important;
              cursor: -webkit-grabbing !important;
            }

            .outline-item.level-1, .outline-item.level-1 button { font-size: 16px; }
            .outline-item.level-1 .toggle::before { }
            .outline-item.level-1 .item-wrapper { padding-top: 12px; padding-bottom: 12px; }
            .outline-item.level-2, .outline-item.level-2 button { font-size: 16px; font-weight: normal; }
            .outline-item.level-2 .toggle::before { top: -3px; }
            .outline-item.level-2 .item-wrapper { padding-top: 8px; padding-bottom: 8px; }
            .outline-item.level-3, .outline-item.level-3 button { font-size: 14px; font-weight: normal; color: #888; }
            .outline-item.level-3 .toggle::before { top: -3px; }
            .outline-item.level-3 .item-wrapper { padding-top: 8px; padding-bottom: 8px; }
            .outline-item.level-4, .outline-item.level-4 button { font-size: 12px; font-weight: normal; color: #888; }
            .outline-item.level-4 .toggle::before { top: -1px; }
            .outline-item.level-4 .item-wrapper { padding-top: 8px; padding-bottom: 8px; }
            .outline-item.level-5, .outline-item.level-5 button { font-size: 12px; font-weight: normal; color: #888; }
            .outline-item.level-5 .toggle::before { top: -2px; }
            .outline-item.level-5 .item-wrapper { padding-top: 5px; padding-bottom: 5px; }
            .outline-item.level-6, .outline-item.level-6 button { font-size: 12px; font-weight: normal; color: #888; }
            .outline-item.level-6 .toggle::before { top: -2px; }
            .outline-item.level-6 .item-wrapper { padding-top: 5px; padding-bottom: 5px; }
        `}
        </style>
      </div>
    );
  }
}
