import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

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
  const outline = findHeaders(source, toHtml, headerRegex)
    .map(heading => ({
      ...heading,
      children: [],
      path: [],
    }))
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
    };
  }
  render() {
    const SortableItem = SortableElement(({ value }) => (
      <li className="item">
        <button onClick={() => this.props.onItemClick(value)}>{value.content}</button>
        <SortableList
          items={value.children}
          onSortEnd={indicies => this.props.onOrderChange(value, indicies)}
        />
      </li>
    ));
    const SortableList = SortableContainer(({ items }) => (
      <ul className="list">
        {items.map(value => (
          <SortableItem key={`item-${value.index}`} index={value.index} value={value} />
        ))}
      </ul>
    ));
    return (
      <div className="root">
        <SortableList
          items={this.props.outline}
          onSortEnd={indicies => this.props.onOrderChange(null, indicies)}
        />
        <style jsx global>{`
            .root {
              background-color: #222;
            }
            .list {
              list-style-type: none;
              // background-color: blue;
              padding-left: 15px;
              margin-bottom: 5px;
              border-left: 1px solid #333;
              // padding-left: 3px;
            }
            .list:first-child {
              margin-top: 0;
              padding-left: 0px;
              border-top: 0;
            }
            .item {
              margin: 2px 0;
            }
            .item button {
              text-align: left;
              color: #ddd;
              background-color: transparent;
              padding: 5px 0;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              width: 100%;
              border: 0;
            }
        `}
        </style>
      </div>
    );
  }
}

export default Outline;
