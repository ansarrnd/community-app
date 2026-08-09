import { saveSecureToken, getSecureToken, deleteSecureToken } from '../../utils/securityStorage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('SecurityStorage Unit Tests', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.clearAllMocks();
  });

  describe('Native Platform (iOS / Android)', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('saves token via SecureStore.setItemAsync', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await saveSecureToken('auth_token', 'jwt-12345');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'jwt-12345');
    });

    it('retrieves token via SecureStore.getItemAsync', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('jwt-12345');

      const token = await getSecureToken('auth_token');

      expect(token).toBe('jwt-12345');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('deletes token via SecureStore.deleteItemAsync', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await deleteSecureToken('auth_token');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Web Platform Fallback', () => {
    let mockSessionStorage: Record<string, string> = {};

    beforeEach(() => {
      Platform.OS = 'web';
      mockSessionStorage = {};

      // Mock window.sessionStorage
      Object.defineProperty(global, 'window', {
        value: {
          sessionStorage: {
            setItem: jest.fn((key: string, val: string) => {
              mockSessionStorage[key] = val;
            }),
            getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
            removeItem: jest.fn((key: string) => {
              delete mockSessionStorage[key];
            }),
          },
        },
        writable: true,
      });
    });

    it('saves token in sessionStorage on Web', async () => {
      await saveSecureToken('web_token', 'web-secret-99');

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('web_token', 'web-secret-99');
      expect(mockSessionStorage['web_token']).toBe('web-secret-99');
    });

    it('gets token from sessionStorage on Web', async () => {
      mockSessionStorage['web_token'] = 'web-secret-99';

      const token = await getSecureToken('web_token');

      expect(token).toBe('web-secret-99');
      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('web_token');
    });

    it('deletes token from sessionStorage on Web', async () => {
      mockSessionStorage['web_token'] = 'web-secret-99';

      await deleteSecureToken('web_token');

      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('web_token');
      expect(mockSessionStorage['web_token']).toBeUndefined();
    });
  });
});
