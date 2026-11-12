const persistStorage = {
  getItem: (key: string) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },

  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },

  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default persistStorage;
