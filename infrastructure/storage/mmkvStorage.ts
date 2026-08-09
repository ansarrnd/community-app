import { Platform } from 'react-native';

class LocalStorageFallback {
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

export const storage = new LocalStorageFallback();

export const clientPersister = {
  persistClient: async (client: any) => {
    storage.set('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = storage.getString('REACT_QUERY_OFFLINE_CACHE');
    return raw ? JSON.parse(raw) : undefined;
  },
  removeClient: async () => {
    storage.delete('REACT_QUERY_OFFLINE_CACHE');
  },
};
