import { storage, clientPersister } from '../../infrastructure/storage/mmkvStorage';

describe('MMKV / LocalStorage Storage Unit Tests', () => {
  beforeEach(() => {
    storage.delete('TEST_KEY');
    storage.delete('REACT_QUERY_OFFLINE_CACHE');
  });

  describe('storage adapter', () => {
    it('sets and gets string values in memory/cache', () => {
      storage.set('TEST_KEY', 'Hello World');
      const value = storage.getString('TEST_KEY');
      expect(value).toBe('Hello World');
    });

    it('deletes stored values', () => {
      storage.set('TEST_KEY', 'Value to delete');
      storage.delete('TEST_KEY');
      const value = storage.getString('TEST_KEY');
      expect(value).toBeUndefined();
    });

    it('returns undefined for non-existent keys', () => {
      const value = storage.getString('NON_EXISTENT_KEY');
      expect(value).toBeUndefined();
    });
  });

  describe('clientPersister for React Query', () => {
    it('persists client state to storage', async () => {
      const mockClient = { timestamp: 12345, queryData: ['evt-1'] };
      await clientPersister.persistClient(mockClient);

      const restored = await clientPersister.restoreClient();
      expect(restored).toEqual(mockClient);
    });

    it('removes client state from storage', async () => {
      const mockClient = { timestamp: 12345 };
      await clientPersister.persistClient(mockClient);
      await clientPersister.removeClient();

      const restored = await clientPersister.restoreClient();
      expect(restored).toBeUndefined();
    });

    it('returns undefined when no cache is stored', async () => {
      const restored = await clientPersister.restoreClient();
      expect(restored).toBeUndefined();
    });
  });
});
