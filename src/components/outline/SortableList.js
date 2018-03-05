import React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span title="Move this section" className="dragHandle">☰</span>);
const SortableItem = SortableElement(({
  value,
  onOrderChange,
  onItemClick,
  hidden,
  onSectionToggle,
}) => {
  const key = `${value.content}${value.index}`;

  return (
    <li className={`outline-item level-${value.level}`}>
      {/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid */}
      <a
        title="Go to this section"
        className="item-wrapper"
        onClick={() => onItemClick(value)}
        role="button"
        tabIndex={value.index}
      >
        {/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid */}
        <button
          title="Collapse/expand section"
          className={`toggle ${value.children.length > 0 ? '' : 'invisible'} ${hidden[key] ? 'closed' : 'opened'}`}
          onClick={() => onSectionToggle(key)}
        />
        <span
          className="text"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: value.content.replace(/<[^>]*>/g, '') }}
        />
        <DragHandle />
      </a>
      {!hidden[key] &&
        <SortableList
          items={value.children}
          onSortEnd={indicies => onOrderChange(value, indicies)}
          hidden={hidden}
          onOrderChange={onOrderChange}
          onItemClick={onItemClick}
          onSectionToggle={onSectionToggle}
          useDragHandle
        />
      }
    </li>
  );
});
const SortableList = SortableContainer(({
  items,
  hidden,
  onOrderChange,
  onItemClick,
  onSectionToggle,
}) => (
  <ul className="list">
    {items.map((value, index) => (
      <SortableItem
        key={`item-${value.index}`}
        index={index}
        value={value}
        hidden={hidden}
        onOrderChange={onOrderChange}
        onItemClick={onItemClick}
        onSectionToggle={onSectionToggle}
      />
      ))}
  </ul>
));

export default SortableList;
