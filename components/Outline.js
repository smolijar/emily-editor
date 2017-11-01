import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

function findHeaders(source, toHtml, headerRegex) {
  const dupIndexMap = {};
  return source.match(headerRegex).map((headerSource, index) => {
    dupIndexMap[headerSource] = (dupIndexMap[headerSource] || 0) + 1;
    const html = toHtml(headerSource);
    const [, level, id, content] = html.match(/<h([0-9])[^<>]*id="(.*)"[^<>]*>(.*)<\/h[0-9]>/);
    return {
      source: headerSource,
      html,
      level: Number(level),
      id,
      content,
      index,
      dupIndex: dupIndexMap[headerSource],
    };
  });
}

module.exports.generateOutline = (source, toHtml, headerRegex) => {
  const headers = findHeaders(source, toHtml, headerRegex)
    .map(heading => ({
      ...heading,
      children: [],
      path: [],
    }));
  headers.forEach((heading, i) => {
    const predecessor = headers[i - 1] || null;
    const successor = headers[i + 1] || null;
    headers[i].predecessor = predecessor;
    headers[i].successor = successor;
  });
  const outline = headers
    .reduce((acc, _val) => {
      const val = _val;
      function insert(into, what, ac) {
        if (into.children.length === 0 || what.level - into.level === 1) {
          what.path.push(into.children.length);
          into.children.push(what);
        } else if (into.level < what.level) {
          what.path.push(into.children.length - 1);
          insert(into.children[into.children.length - 1], what, ac);
        } else {
          let anotherInto = ac[what.path[0]];
          what.path.slice(1, what.path.length - 1).forEach((i) => {
            anotherInto = anotherInto.children[i];
          });
          anotherInto.children.push(what);
        }
      }
      if (acc.length === 0) {
        acc.push({ ...val, path: [0] });
      } else {
        const lastHeading = acc[acc.length - 1];
        const lastLevel = lastHeading.level;
        if (val.level <= lastLevel) {
          acc.push({ ...val, path: [acc.length - 1] });
        } else {
          val.path = [acc.length - 1];
          insert(acc[acc.length - 1], val, acc);
        }
      }
      return acc;
    }, []);
  return outline;
};

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
    this.state = {
      hidden: {},
    };
  }
  render() {
    const DragHandle = SortableHandle(() => <span className="dragHandle">::</span>);
    const SortableItem = SortableElement(({ value }) => {
      const key = `${value.content}${value.index}`;
      return (
        <li className={`item level-${value.level}`}>
          <button
            className={`toggle ${value.children.length > 0 ? '' : 'invisible'} ${this.state.hidden[key] ? 'closed' : 'opened'}`}
            onClick={() => {
            this.setState({
                ...this.state,
                hidden: {
                  ...this.state.hidden,
                  [key]: !this.state.hidden[key],
                },
              });
            }}
          />
          <DragHandle />
          <button className="outlineItem" onClick={() => this.props.onItemClick(value)}>{value.content}</button>
          {!this.state.hidden[key] &&
          <SortableList
            items={value.children}
            onSortEnd={indicies => this.props.onOrderChange(value, indicies)}
          />
          }
        </li>
      );
    });
    const SortableList = SortableContainer(({ items }) => (
      <ul className="list">
        {items.map(value => (
          <SortableItem
            key={`item-${value.index}`}
            index={value.index}
            value={value}
            pressDelay={200}
          />
        ))}
      </ul>
    ));
    return (
      <div className="root">
        <SortableList
          items={this.props.outline}
          onSortEnd={indicies => this.props.onOrderChange(null, indicies)}
          pressDelay={200}
        />
        <style jsx global>{`
            .root {
              font-family: 'Roboto', sans-serif;
              background-color: #222;
              color: #ddd;
              height: 100%;
            }
            button:active {
              outline: 0;
            }
            .list {
              list-style-type: none;
              padding-left: 15px;
              margin-bottom: 5px;
              border-left: 1px solid #333;
              position: relative;
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
            }
            .toggle.invisible::before {
              opacity: 0;
            }
            .toggle.opened::before {
              content: '▼';
            }
            .toggle.closed::before {
              content: '▶';
              font-size: 0.76em;
              padding: 0 0.32em;
            }
            .item button.outlineItem {
              width: 100%;
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
