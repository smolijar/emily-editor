import React from 'react';
import PropTypes from 'prop-types';


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
          what.path.push(into.children.length - 1);
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
    this.printList = this.printList.bind(this);
    this.state = {
    };
  }
  printList(h) {
    return (
      <li key={`${h.id}${h.dupIndex}`}>
        <button onClick={() => this.props.onItemClick(h)}>
          {h.content}
        </button>
        {h.children.length > 0 &&
          <ol key={`${h.id}${h.dupIndex}ol`}>
            {h.children.map(this.printList)}
          </ol>
          }
      </li>
    );
  }
  render() {
    return (
      <div>
        <div className="column">
          <ol>
            {this.props.outline.map(heading => this.printList(heading))}
          </ol>
        </div>
      </div>
    );
  }
}

export default Outline;
