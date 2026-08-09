import { CommunityEvent, CreateEventInput, CreateEventInputSchema } from '../models/Event';
import { UserRole, hasPermission } from '../models/User';
import { IEventRepository } from '../repositories/IEventRepository';

export class CreateEventUseCase {
  constructor(private eventRepo: IEventRepository) {}

  async execute(input: CreateEventInput, userRole: UserRole): Promise<CommunityEvent> {
    // 1. Validate Input Schema with Zod
    const validatedInput = CreateEventInputSchema.parse(input);

    // 2. Determine initial status based on role governance
    // Moderators and Admins get auto-approved events; Residents submit as PENDING
    const isAutoApproved = hasPermission(userRole, 'MOD');

    // 3. Delegate creation to repository
    const createdEvent = await this.eventRepo.createEvent(validatedInput);

    if (isAutoApproved) {
      await this.eventRepo.updateEventStatus(createdEvent.id, 'APPROVED', validatedInput.organizerId);
      createdEvent.status = 'APPROVED';
    }

    return createdEvent;
  }
}
