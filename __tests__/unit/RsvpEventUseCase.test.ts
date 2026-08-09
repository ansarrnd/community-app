import { RsvpEventUseCase } from '../../domain/usecases/RsvpEventUseCase';
import { MockEventRepository } from '../../infrastructure/repositories/MockEventRepository';

describe('RsvpEventUseCase Unit Tests', () => {
  let mockRepo: MockEventRepository;
  let useCase: RsvpEventUseCase;

  beforeEach(() => {
    mockRepo = new MockEventRepository();
    useCase = new RsvpEventUseCase(mockRepo);
  });

  it('throws error when eventId or userId is missing', async () => {
    await expect(useCase.execute('', 'usr-1', 'ATTENDING')).rejects.toThrow(
      'Event ID and User ID are required to submit RSVP.'
    );
    await expect(useCase.execute('evt-1', '', 'ATTENDING')).rejects.toThrow(
      'Event ID and User ID are required to submit RSVP.'
    );
  });

  it('submits a new ATTENDING RSVP for an event', async () => {
    const rsvp = await useCase.execute('evt-1', 'usr-test-1', 'ATTENDING');

    expect(rsvp.eventId).toBe('evt-1');
    expect(rsvp.userId).toBe('usr-test-1');
    expect(rsvp.status).toBe('ATTENDING');
    expect(rsvp.id).toBeDefined();

    const userRsvps = await mockRepo.getUserRsvps('usr-test-1');
    expect(userRsvps['evt-1']).toBe('ATTENDING');
  });

  it('submits a DECLINED RSVP for an event', async () => {
    const rsvp = await useCase.execute('evt-1', 'usr-test-2', 'DECLINED');

    expect(rsvp.status).toBe('DECLINED');
    const userRsvps = await mockRepo.getUserRsvps('usr-test-2');
    expect(userRsvps['evt-1']).toBe('DECLINED');
  });

  it('toggles user RSVP status from ATTENDING to DECLINED', async () => {
    await useCase.execute('evt-1', 'usr-test-3', 'ATTENDING');
    const updatedRsvp = await useCase.execute('evt-1', 'usr-test-3', 'DECLINED');

    expect(updatedRsvp.status).toBe('DECLINED');
    const userRsvps = await mockRepo.getUserRsvps('usr-test-3');
    expect(userRsvps['evt-1']).toBe('DECLINED');
  });
});
