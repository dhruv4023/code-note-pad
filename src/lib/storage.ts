// Use chrome.storage.local if available, otherwise fallback to localStorage

declare const chrome: any;

interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

const chromeStorageAdapter: StorageAdapter = {
  async get(key: string) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result: any) => {
        resolve(result[key] ?? null);
      });
    });
  },
  async set(key: string, value: string) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  },
  async remove(key: string) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.remove([key], () => resolve());
    });
  },
};

const localStorageAdapter: StorageAdapter = {
  async get(key: string) {
    return localStorage.getItem(key);
  },
  async set(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  async remove(key: string) {
    localStorage.removeItem(key);
  },
};

const isChromeExtension =
  typeof chrome !== "undefined" &&
  chrome?.storage?.local != null;

export const storage: StorageAdapter = isChromeExtension
  ? chromeStorageAdapter
  : localStorageAdapter;
