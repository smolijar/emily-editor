import _ from 'lodash';
import md5 from 'md5';

const MAX_AGE = 86400000;
const PREFIX = 'emily-backup-';

const getKey = (env = '') => {
  return `${PREFIX}${md5(env)}`;
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

export const autosaveStore = (value, env) => {
  const store = {
    value,
    date: new Date(),
  };
  localStorage.setItem(getKey(env), JSON.stringify(store));
  return store;
};

export const autosaveRetrieve = (env) => {
  cleanup();
  let retrieved = localStorage.getItem(getKey(env));
  if (retrieved) {
    retrieved = JSON.parse(retrieved);
    retrieved.date = new Date(retrieved.date);
    return retrieved;
  }
  return null;
};
