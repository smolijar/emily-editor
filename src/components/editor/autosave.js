const getKey = Editor => `editor-content-${Editor.props.language.name}`;

module.exports.autosaveStore = (value, Editor) => {
  const store = {
    value,
    date: new Date(),
  };
  localStorage.setItem(getKey(Editor), JSON.stringify(store));
  return store;
};

module.exports.autosaveRetrieve = (Editor) => {
  let retrieved = localStorage.getItem(getKey(Editor));
  if (retrieved) {
    retrieved = JSON.parse(retrieved);
    retrieved.date = new Date(retrieved.date);
    return retrieved;
  }
  return null;
};
