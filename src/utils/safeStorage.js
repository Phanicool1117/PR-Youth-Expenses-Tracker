// Safe Storage wrapper with in-memory fallback for mobile webviews & private browsing modes

const memoryStore = {};

export const safeStorage = {
  getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage restricted / private mode
    }
    return memoryStore[key] || null;
  },

  setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Storage restricted / quota exceeded
    }
    memoryStore[key] = value;
  },

  removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    delete memoryStore[key];
  },

  getSessionItem(key) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {}
    return memoryStore[`session_${key}`] || null;
  },

  setSessionItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (e) {}
    memoryStore[`session_${key}`] = value;
  },

  clearSession() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (e) {}
    Object.keys(memoryStore).forEach((k) => {
      if (k.startsWith('session_')) delete memoryStore[k];
    });
  },
};
