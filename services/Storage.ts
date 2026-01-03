
const PREFIX_PROD = 'sellit_';
const PREFIX_TEST = 'sellit_test_';

export const getStoragePrefix = () => {
  const isTestMode = localStorage.getItem('sellit_config_testmode') === 'true';
  return isTestMode ? PREFIX_TEST : PREFIX_PROD;
};

export const Storage = {
  get: (key: string) => {
    return localStorage.getItem(`${getStoragePrefix()}${key}`);
  },
  set: (key: string, value: string) => {
    localStorage.setItem(`${getStoragePrefix()}${key}`, value);
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event('storage'));
  },
  remove: (key: string) => {
    localStorage.removeItem(`${getStoragePrefix()}${key}`);
  },
  clearNamespace: () => {
    const prefix = getStoragePrefix();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};
