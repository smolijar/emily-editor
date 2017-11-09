import React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span className="dragHandle">𝍢</span>);
const SortableItem = SortableElement(({
  value,
  onOrderChange,
  onItemClick,
  hidden,
  onSectionToggle,
}) => {
  const key = `${value.content}${value.index}`;
  return (
    <li className={`item level-${value.level}`}>
      <button
        className={`toggle ${value.children.length > 0 ? '' : 'invisible'} ${hidden[key] ? 'closed' : 'opened'}`}
        onClick={() => onSectionToggle(key)}
      />
      <button className="item-wrapper" onClick={() => onItemClick(value)}>
        <DragHandle />
        <span
          className="outlineItem"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: value.content.replace(/<[^>]*>/g, '') }}
        />
      </button>
      {!hidden[key] &&
        <SortableList
          items={value.children}
          onSortEnd={indicies => onOrderChange(value, indicies)}
          hidden={hidden}
          onOrderChange={onOrderChange}
          onItemClick={onItemClick}
          onSectionToggle={onSectionToggle}
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
