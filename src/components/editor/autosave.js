import _ from 'lodash';

const getKey = Editor => `editor-content-${Editor.props.language.name}`;

const MAX_AGE = 86400000;

const cleanup = () => _.entries(localStorage)
  .filter(([key, val]) => key.startsWith('editor-content-'))
  .forEach(([key, val]) => {
    const age = new Date() - new Date(JSON.parse(val).date);
    if (age > MAX_AGE) {
      localStorage.removeItem(key);
    }
  });

export const autosaveStore = (value, Editor) => {
  const store = {
    value,
    date: new Date(),
  };
  localStorage.setItem(getKey(Editor), JSON.stringify(store));
  return store;
};

export const autosaveRetrieve = (Editor) => {
  cleanup();
  let retrieved = localStorage.getItem(getKey(Editor));
  if (retrieved) {
    retrieved = JSON.parse(retrieved);
    retrieved.date = new Date(retrieved.date);
    return retrieved;
  }
  return null;
};
