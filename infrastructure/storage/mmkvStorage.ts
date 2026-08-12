import { Platform } from 'react-native';

interface StringStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

class LocalStorageFallback implements StringStorage {
  private cache: Map<string, string> = new Map();

  getString(key: string): string | undefined {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) ?? undefined;
    }
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    this.cache.set(key, value);
  }

  delete(key: string): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    this.cache.delete(key);
  }
}

function createMmkvStorage(): StringStorage | null {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'community-app-cache' });
    return {
      getString: (key: string) => mmkv.getString(key) ?? undefined,
      set: (key: string, value: string) => mmkv.set(key, value),
      delete: (key: string) => mmkv.delete(key),
    };
  } catch {
    return null;
  }
}

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';
const mmkvStorage = createMmkvStorage();
export const storage: StringStorage = mmkvStorage ?? new LocalStorageFallback();

/** MMKV-backed (or web fallback) persister for TanStack Query offline cache */
export const clientPersister = {
  persistClient: async (client: unknown) => {
    storage.set(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = storage.getString(CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  },
  removeClient: async () => {
    storage.delete(CACHE_KEY);
  },
};
