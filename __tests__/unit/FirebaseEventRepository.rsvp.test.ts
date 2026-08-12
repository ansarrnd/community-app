const mockRunTransaction = jest.fn();
const mockTransactionGet = jest.fn();
const mockTransactionUpdate = jest.fn();
const mockTransactionSet = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'events-collection'),
  doc: jest.fn((_db: unknown, collectionName: string, id: string) => ({
    path: `${collectionName}/${id}`,
    id,
  })),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
  limit: jest.fn(),
  startAfter: jest.fn(),
  runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2026-01-01T00:00:00Z') })),
  },
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

import { FirebaseEventRepository } from '../../infrastructure/repositories/FirebaseEventRepository';

describe('FirebaseEventRepository.rsvpToEvent', () => {
  let repo: FirebaseEventRepository;

  beforeEach(() => {
    repo = new FirebaseEventRepository();
    mockRunTransaction.mockReset();
    mockTransactionGet.mockReset();
    mockTransactionUpdate.mockReset();
    mockTransactionSet.mockReset();

    const transaction = {
      get: mockTransactionGet,
      update: mockTransactionUpdate,
      set: mockTransactionSet,
    };

    mockRunTransaction.mockImplementation(async (_db, callback) => callback(transaction));
  });

  it('updates event counters and upserts RSVP in a transaction', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ rsvpCount: 5, attendingCount: 4, declinedCount: 1 }),
      })
      .mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
      });

    const rsvp = await repo.rsvpToEvent('evt-1', 'user-1', 'ATTENDING');

    expect(mockTransactionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-1' }),
      expect.objectContaining({
        rsvpCount: 6,
        attendingCount: 5,
        declinedCount: 1,
      })
    );
    expect(mockTransactionSet).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-1_user-1' }),
      expect.objectContaining({
        eventId: 'evt-1',
        userId: 'user-1',
        status: 'ATTENDING',
      })
    );
    expect(rsvp).toEqual(
      expect.objectContaining({
        id: 'evt-1_user-1',
        eventId: 'evt-1',
        userId: 'user-1',
        status: 'ATTENDING',
      })
    );
  });

  it('swaps attending/declined counts when RSVP status changes', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ rsvpCount: 2, attendingCount: 1, declinedCount: 1 }),
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'DECLINED', timestamp: undefined }),
      });

    await repo.rsvpToEvent('evt-2', 'user-2', 'ATTENDING');

    expect(mockTransactionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-2' }),
      expect.objectContaining({
        rsvpCount: 2,
        attendingCount: 2,
        declinedCount: 0,
      })
    );
  });
});
