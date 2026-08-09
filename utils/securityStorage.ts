import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveSecureToken = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

export const getSecureToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
    return null;
  }
  return await SecureStore.getItemAsync(key);
};

export const deleteSecureToken = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
};
