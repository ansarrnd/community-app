import { ManageRoleUseCase } from '../../domain/usecases/ManageRoleUseCase';
import { MockUserRepository } from '../../infrastructure/repositories/MockUserRepository';

describe('ManageRoleUseCase', () => {
  let userRepo: MockUserRepository;
  let useCase: ManageRoleUseCase;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    useCase = new ManageRoleUseCase(userRepo);
  });

  it('allows ADMIN to update another user role', async () => {
    await useCase.execute('ADMIN', 'demo-user-resident', 'MOD', 'demo-user-admin');

    const updated = await userRepo.getUserById('demo-user-resident');
    expect(updated?.role).toBe('MOD');
  });

  it('rejects non-admin callers', async () => {
    await expect(useCase.execute('MOD', 'demo-user-resident', 'USER')).rejects.toThrow(/Only administrators/);
  });

  it('prevents admin from demoting their own account', async () => {
    await expect(
      useCase.execute('ADMIN', 'demo-user-admin', 'USER', 'demo-user-admin')
    ).rejects.toThrow(/cannot demote their own account/);
  });
});
