const getKey = () => 'content';

module.exports.autosaveStore = (value) => {
  const store = {
    value,
    date: new Date(),
  };
  localStorage.setItem(getKey(), JSON.stringify(store));
  return store;
};

module.exports.autosaveRetrieve = () => {
  const retrieved = localStorage.getItem(getKey());
  if (retrieved) {
    console.log(retrieved);
    return JSON.parse(retrieved);
  }
  return null;
};
