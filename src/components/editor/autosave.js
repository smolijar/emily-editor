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
  let retrieved = localStorage.getItem(getKey());
  if (retrieved) {
    retrieved = JSON.parse(retrieved);
    retrieved.date = new Date(retrieved.date);
    return retrieved;
  }
  return null;
};
