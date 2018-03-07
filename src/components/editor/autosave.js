import _ from 'lodash';
import md5 from 'md5';

const MAX_AGE = 86400000;
const PREFIX = 'emily-backup-';

const getKey = (Editor) => {
  const { name, content } = Editor.props;
  return `${PREFIX}${md5(name + content)}`;
};


const cleanup = () => _.entries(localStorage)
  .filter(([key]) => key.startsWith(PREFIX))
  .forEach(([key, val]) => {
    const age = new Date() - new Date(JSON.parse(val).date);
    if (age > MAX_AGE) {
      console.warn(key);
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
