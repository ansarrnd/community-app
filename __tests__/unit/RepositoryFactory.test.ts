import { RepositoryFactory } from '../../infrastructure/factory/RepositoryFactory';
import { MockEventRepository } from '../../infrastructure/repositories/MockEventRepository';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('RepositoryFactory Unit Tests', () => {
  const originalEnv = process.env.EXPO_PUBLIC_BACKEND_PROVIDER;

  afterEach(() => {
    process.env.EXPO_PUBLIC_BACKEND_PROVIDER = originalEnv;
  });

  it('returns MockEventRepository by default when EXPO_PUBLIC_BACKEND_PROVIDER is empty or mock', () => {
    delete process.env.EXPO_PUBLIC_BACKEND_PROVIDER;

    const repo = RepositoryFactory.getEventRepository();
    expect(repo).toBeDefined();
    expect(repo).toBeInstanceOf(MockEventRepository);
  });

  it('returns the singleton repository instance on subsequent calls', () => {
    const instance1 = RepositoryFactory.getEventRepository();
    const instance2 = RepositoryFactory.getEventRepository();
    expect(instance1).toBe(instance2);
  });
});
