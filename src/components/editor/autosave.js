import _ from 'lodash';
import md5 from 'md5';

const PREFIX = 'emily-backup-';

const getKey = (env) => `${PREFIX}${md5(env)}`;

const cleanup = () => _.entries(localStorage)
  .filter(([key]) => key.startsWith(PREFIX))
  .forEach(([key, val]) => {
    if (new Date() >= new Date(JSON.parse(val).ttd)) {
      localStorage.removeItem(key);
    }
  });

export const autosaveStore = (value, env = '', ttl = 86400000) => {
  const store = {
    value,
    date: new Date(),
    ttd: new Date(new Date().getTime() + ttl),
  };
  localStorage.setItem(getKey(env), JSON.stringify(store));
  return store;
};

export const autosaveRetrieve = (env = '') => {
  cleanup();
  let retrieved = localStorage.getItem(getKey(env));
  if (retrieved) {
    retrieved = JSON.parse(retrieved);
    retrieved.date = new Date(retrieved.date);
    return retrieved;
  }
  return null;
};
