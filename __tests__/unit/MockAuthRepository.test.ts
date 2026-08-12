import { MockAuthRepository } from '../../infrastructure/repositories/MockAuthRepository';
import { MockUserRepository } from '../../infrastructure/repositories/MockUserRepository';

describe('MockAuthRepository', () => {
  let userRepo: MockUserRepository;
  let authRepo: MockAuthRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    authRepo = new MockAuthRepository(userRepo);
  });

  it('signs in demo users by role', async () => {
    const resident = await authRepo.signInDemoUser('USER');
    expect(resident.role).toBe('USER');
    expect(resident.uid).toBe('demo-user-resident');

    const mod = await authRepo.signInDemoUser('MOD');
    expect(mod.role).toBe('MOD');
  });

  it('returns current user after sign-in', async () => {
    await authRepo.signInDemoUser('MOD');
    const current = await authRepo.getCurrentUser();
    expect(current?.role).toBe('MOD');
  });

  it('clears session on signOut', async () => {
    await authRepo.signInDemoUser('USER');
    await authRepo.signOut();
    const current = await authRepo.getCurrentUser();
    expect(current).toBeNull();
  });
});
