import { CreateEventUseCase } from '../../domain/usecases/CreateEventUseCase';
import { MockEventRepository } from '../../infrastructure/repositories/MockEventRepository';
import { CreateEventInput } from '../../domain/models/Event';

describe('CreateEventUseCase Domain Unit Tests', () => {
  let mockRepo: MockEventRepository;
  let useCase: CreateEventUseCase;

  beforeEach(() => {
    mockRepo = new MockEventRepository();
    useCase = new CreateEventUseCase(mockRepo);
  });

  it('submits events as PENDING for standard USER role', async () => {
    const input: CreateEventInput = {
      title: 'Community Cleanup Drive',
      category: 'CULTURAL',
      date: '2026-09-01',
      time: '09:00 AM',
      venue: 'Town Central Park',
      details: 'Join us to clean and plant flowers in the central community park.',
      organizerId: 'usr-1',
      organizerName: 'Resident Member',
    };

    const created = await useCase.execute(input, 'USER');
    expect(created.id).toBeDefined();
    expect(created.status).toBe('PENDING');
  });

  it('auto-approves events submitted by MOD or ADMIN roles', async () => {
    const input: CreateEventInput = {
      title: 'Official Council Assembly',
      category: 'MEETING',
      date: '2026-09-10',
      time: '02:00 PM',
      venue: 'City Hall Auditorium',
      details: 'Official public council assembly on infrastructure and development.',
      organizerId: 'usr-admin',
      organizerName: 'Admin Member',
    };

    const created = await useCase.execute(input, 'ADMIN');
    expect(created.id).toBeDefined();
    expect(created.status).toBe('APPROVED');
  });

  it('throws Zod validation error when title is too short', async () => {
    const invalidInput: any = {
      title: 'Hi', // Too short
      category: 'CULTURAL',
      date: '2026-09-01',
      time: '09:00 AM',
      venue: 'Park',
      details: 'Short details',
      organizerId: 'usr-1',
    };

    await expect(useCase.execute(invalidInput, 'USER')).rejects.toThrow();
  });
});
