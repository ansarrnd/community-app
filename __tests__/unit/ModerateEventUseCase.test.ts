import { ModerateEventUseCase } from '../../domain/usecases/ModerateEventUseCase';
import { MockEventRepository } from '../../infrastructure/repositories/MockEventRepository';

describe('ModerateEventUseCase Unit Tests', () => {
  let mockRepo: MockEventRepository;
  let useCase: ModerateEventUseCase;

  beforeEach(() => {
    mockRepo = new MockEventRepository();
    useCase = new ModerateEventUseCase(mockRepo);
  });

  it('allows MOD role to approve pending events', async () => {
    // Pending event in mock repo is 'evt-4'
    const pendingBefore = await mockRepo.getEventById('evt-4');
    expect(pendingBefore?.status).toBe('PENDING');

    await useCase.execute('evt-4', 'APPROVED', 'mod-usr-1', 'MOD');

    const updated = await mockRepo.getEventById('evt-4');
    expect(updated?.status).toBe('APPROVED');
  });

  it('allows ADMIN role to reject pending events', async () => {
    await useCase.execute('evt-4', 'REJECTED', 'admin-usr-1', 'ADMIN');

    const updated = await mockRepo.getEventById('evt-4');
    expect(updated?.status).toBe('REJECTED');
  });

  it('throws unauthorized error when USER role attempts to moderate', async () => {
    await expect(
      useCase.execute('evt-4', 'APPROVED', 'user-1', 'USER')
    ).rejects.toThrow('Unauthorized: Only Moderators or Administrators can approve/reject community events.');

    // Status should remain unchanged
    const event = await mockRepo.getEventById('evt-4');
    expect(event?.status).toBe('PENDING');
  });
});
